import {
  ClientError,
  HarmBlockThreshold,
  HarmCategory,
  VertexAI,
} from "@google-cloud/vertexai"

import {
  AIChatAnalysis,
  AIAnalysisSchema,
  AIChatParticipantAnalysis,
  ParticipantAnalysis,
  AIChatAnalysisArgs,
  AnalyzeSegmentArgs,
  UpdateBatchAnalysisArgs,
  MergeParticipantAnalysesArgs,
  CombineAnalysesResultsArgs,
} from "./types"
import { calculatePercentageChange } from "./utils"

import {
  AI_RESOLVE_RETRIES,
  MAX_PROCESSING_TIME,
  MIN_SEGMENTS_PER_BATCH,
  PROMPT,
} from "./constants"
import { FieldValue } from "firebase-admin/firestore"
import { firestore } from "./config"
import posthogClient from "./posthog"

class RateLimiter {
  private requestTimes: number[] = []
  private readonly limit: number
  private readonly window: number

  constructor(limit: number, window: number) {
    this.limit = limit
    this.window = window
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requestTimes = this.requestTimes.filter(
      (time) => now - time < this.window
    )
    return this.requestTimes.length < this.limit
  }

  addRequest() {
    this.requestTimes.push(Date.now())
  }

  timeUntilNextSlot(): number {
    if (this.canMakeRequest()) return 0
    return this.window - (Date.now() - this.requestTimes[0])
  }
}

class RetryablePromise<T> extends Promise<T> {
  private static rateLimiter = new RateLimiter(200, 60000) // 200 requests per minute

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void
  ) {
    super(executor)
  }

  static async retry<T>(
    retries: number,
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: any) => void
    ) => void,
    baseDelay: number = 10000
  ): Promise<T> {
    const execute = async (): Promise<T> => {
      if (!this.rateLimiter.canMakeRequest()) {
        const waitTime = this.rateLimiter.timeUntilNextSlot()
        await new Promise((resolve) => setTimeout(resolve, waitTime))
        return execute()
      }

      this.rateLimiter.addRequest()
      return new RetryablePromise<T>(executor)
    }

    try {
      return await execute()
    } catch (error) {
      if (retries > 0) {
        console.error(`Retrying due to error: ${error}`)

        let delay = baseDelay

        if (
          error instanceof ClientError &&
          error.message.includes("404 Not Found")
        ) {
          return RetryablePromise.reject(error)
        } else if (
          error instanceof SyntaxError &&
          error.message.includes("JSON")
        ) {
          await new Promise((resolve) => setTimeout(resolve, delay))
          return RetryablePromise.retry(retries - 3, executor, baseDelay)
        } else if (
          error instanceof ClientError &&
          error.message.includes("429 Too Many Requests")
        ) {
          delay = Math.min(baseDelay * Math.pow(2, retries - 1), 180000) // Cap at 1 minute
          delay += Math.random() * 100000 // Add jitter

          await new Promise((resolve) => setTimeout(resolve, delay))
          return RetryablePromise.retry(retries - 1, executor, baseDelay)
        } else {
          await new Promise((resolve) => setTimeout(resolve, delay))
          return RetryablePromise.retry(retries - 1, executor, baseDelay)
        }
      } else {
        return RetryablePromise.reject(error)
      }
    }
  }

  static reject(error: any): Promise<never> {
    return Promise.reject(error)
  }
}

/**
 * Removes markdown code block delimiters from a string.
 *
 * This function removes the JSON code block delimiters and inline code delimiters from the given text.
 *
 * @param {string} text - The text from which markdown delimiters should be removed.
 * @returns {string} - The text with markdown delimiters removed.
 * @example
 * const cleanedText = removeMarkdownDelimiters("```json\n{\"key\": \"value\"}\n```");
 * console.log(cleanedText); // Outputs: {"key": "value"}
 */
function removeMarkdownDelimiters(text: string): string {
  return text
    .replace(/^```json\s*|\s*```$/g, "")
    .replace(/`/g, "")
    .trim()
}

// Get category
function findCategoryConfidence(
  participantAnalysis: ParticipantAnalysis,
  name: string
) {
  const category = participantAnalysis.categories.find(
    (cat) => cat.name === name
  )
  if (category && "confidence" in category) {
    return category.confidence
  }
  return 0
}

// Update Category
function updateCategoryConfidence(
  participantAnalysis: ParticipantAnalysis,
  name: string,
  confidence: number
) {
  const category = participantAnalysis.categories.find(
    (cat) => cat.name === name
  )
  if (category && "confidence" in category) {
    category.confidence = confidence
  }
}

// Get personality
function findPersonalityValue(participantAnalysis: ParticipantAnalysis) {
  const category = participantAnalysis.categories.find(
    (cat) => cat.name === "Personality"
  )
  if (category && "value" in category) {
    return category.value
  }
  return "None"
}

function combineAnalysesResults({
  results,
  personalityCounts,
}: CombineAnalysesResultsArgs): AIChatAnalysis {
  return results.reduce((combinedResults, analysis) => {
    for (const participant in analysis) {
      if (!combinedResults[participant]) {
        combinedResults[participant] = { categories: [] }
      }

      const currentCategories = combinedResults[participant].categories

      analysis[participant].categories.forEach((category) => {
        if ("confidence" in category) {
          // Handle categories with confidence
          const existingCategory = currentCategories.find(
            (cat) => "name" in cat && cat.name === category.name
          )

          if (existingCategory && "confidence" in existingCategory) {
            // Average the confidence for repeated categories
            existingCategory.confidence = Number(
              ((existingCategory.confidence + category.confidence) / 2).toFixed(
                2
              )
            )
          } else {
            // If the category is not found, add it
            currentCategories.push({ ...category })
          }
        } else if ("value" in category) {
          // Handle the Personality category (which has a value, not confidence)
          if (!personalityCounts[participant]) {
            personalityCounts[participant] = {}
          }

          // Increment the count for this personality type
          if (personalityCounts[participant][category.value]) {
            personalityCounts[participant][category.value] += 1
          } else {
            personalityCounts[participant][category.value] = 1
          }

          // Determine the most frequent personality
          const mostFrequentPersonality = Object.keys(
            personalityCounts[participant]
          ).reduce(
            (prev, curr) =>
              personalityCounts[participant][curr] >
              personalityCounts[participant][prev]
                ? curr
                : prev,
            Object.keys(personalityCounts[participant])[0]
          )

          // Check if Personality category exists and update it
          const existingPersonality = currentCategories.find(
            (cat) => "name" in cat && cat.name === "Personality"
          )

          if (existingPersonality && "value" in existingPersonality) {
            existingPersonality.value = mostFrequentPersonality
          } else {
            // If Personality is not found, add it
            currentCategories.push({
              name: "Personality",
              value: mostFrequentPersonality,
            })
          }
        }
      })
    }

    return combinedResults
  }, {} as AIChatAnalysis)
}

// Helper function to prepare participant data
function prepareParticipantData(
  participantAnalysis: ParticipantAnalysis,
  percentageChanges: { [key: string]: number },
  previousPersonality: string
) {
  return {
    sarcasmConfidence: findCategoryConfidence(participantAnalysis, "Sarcasm"),
    sarcasmConfidencePercentageChange: percentageChanges["Sarcasm"] ?? 0,
    conversationInitiationRate: findCategoryConfidence(
      participantAnalysis,
      "Conversation Initiation Rate"
    ),
    conversationInitiationRatePercentageChange:
      percentageChanges["Conversation Initiation Rate"] ?? 0,
    engagementScore: findCategoryConfidence(
      participantAnalysis,
      "Engagement Score"
    ),
    engagementScorePercentageChange: percentageChanges["Engagement Score"] ?? 0,
    toxicConfidence: findCategoryConfidence(participantAnalysis, "Toxic"),
    toxicConfidencePercentageChange: percentageChanges["Toxic"] ?? 0,
    drugsConfidence: findCategoryConfidence(participantAnalysis, "Drugs"),
    drugsConfidencePercentageChange: percentageChanges["Drugs"] ?? 0,
    romanticConfidence: findCategoryConfidence(participantAnalysis, "Romantic"),
    romanticConfidencePercentageChange: percentageChanges["Romantic"] ?? 0,
    profanityConfidence: findCategoryConfidence(
      participantAnalysis,
      "Profanity"
    ),
    profanityConfidencePercentageChange: percentageChanges["Profanity"] ?? 0,
    politicsConfidence: findCategoryConfidence(participantAnalysis, "Politics"),
    politicsConfidencePercentageChange: percentageChanges["Politics"] ?? 0,
    financeConfidence: findCategoryConfidence(participantAnalysis, "Finance"),
    financeConfidencePercentageChange: percentageChanges["Finance"] ?? 0,
    humorConfidence: findCategoryConfidence(participantAnalysis, "Humor"),
    humorConfidencePercentageChange: percentageChanges["Finance"] ?? 0,
    personality: findPersonalityValue(participantAnalysis),
    previousPersonality: previousPersonality,
    updatedAt: FieldValue.serverTimestamp(),
  } satisfies AIChatParticipantAnalysis
}

async function analyzeSegment({
  generativeModel,
  userId,
  fileAnalysisId,
  segmentIndex,
}: AnalyzeSegmentArgs): Promise<AIChatAnalysis> {
  return RetryablePromise.retry<AIChatAnalysis>(
    AI_RESOLVE_RETRIES,
    async (resolve, reject) => {
      try {
        const filePart = {
          fileData: {
            fileUri: `gs://chattier-7b9f0/analyses/${userId}/${fileAnalysisId}/segment${segmentIndex}.txt`,
            mimeType: "text/plain",
          },
        }

        const textPart = { text: PROMPT }

        const request = {
          contents: [{ role: "user", parts: [filePart, textPart] }],
        }

        const responseStream = await generativeModel.generateContentStream(
          request
        )
        const aggregatedResponse = await responseStream.response
        const fullTextResponse =
          aggregatedResponse.candidates![0].content.parts[0].text
        const rawText = removeMarkdownDelimiters(fullTextResponse || "")

        const parsedText = JSON.parse(rawText)
        const validationResult: AIChatAnalysis =
          AIAnalysisSchema.parse(parsedText)

        resolve(validationResult)
      } catch (err) {
        reject(err)
      }
    }
  )
}

async function mergeParticipantAnalyses({
  participantAnalysis,
  participantDocumentReference,
}: MergeParticipantAnalysesArgs): Promise<ParticipantAnalysis> {
  try {
    // Get data from the previous batch
    const previousBatchParticipantDocumentSnapshot =
      await participantDocumentReference.get()
    const previousBatchParticipantData =
      previousBatchParticipantDocumentSnapshot.data()! as AIChatParticipantAnalysis

    // Merge data
    const mergedParticipantData: Record<string, number> = {
      Sarcasm:
        (findCategoryConfidence(participantAnalysis, "Sarcasm") +
          previousBatchParticipantData.sarcasmConfidence) /
        2,
      "Conversation Initiation Rate":
        (findCategoryConfidence(
          participantAnalysis,
          "Conversation Initiation Rate"
        ) +
          previousBatchParticipantData.conversationInitiationRate) /
        2,
      "Engagement Score":
        (findCategoryConfidence(participantAnalysis, "Engagement Score") +
          previousBatchParticipantData.engagementScore) /
        2,
      Toxic:
        (findCategoryConfidence(participantAnalysis, "Toxic") +
          previousBatchParticipantData.toxicConfidence) /
        2,
      Drugs:
        (findCategoryConfidence(participantAnalysis, "Drugs") +
          previousBatchParticipantData.drugsConfidence) /
        2,
      Romantic:
        (findCategoryConfidence(participantAnalysis, "Romantic") +
          previousBatchParticipantData.romanticConfidence) /
        2,
      Profanity:
        (findCategoryConfidence(participantAnalysis, "Profanity") +
          previousBatchParticipantData.profanityConfidence) /
        2,
      Politics:
        (findCategoryConfidence(participantAnalysis, "Politics") +
          previousBatchParticipantData.politicsConfidence) /
        2,
      Finance:
        (findCategoryConfidence(participantAnalysis, "Finance") +
          previousBatchParticipantData.financeConfidence) /
        2,
      Humor:
        (findCategoryConfidence(participantAnalysis, "Humor") +
          previousBatchParticipantData.humorConfidence) /
        2,
    }

    // Update participantAnalysis
    for (const category in mergedParticipantData) {
      updateCategoryConfidence(
        participantAnalysis,
        category,
        mergedParticipantData[category]
      )
    }
  } catch (error) {
    console.error("Error getting previous participant data:", error)
  }

  return participantAnalysis
}

async function updateBatchAnalysis({
  analysis,
  recentChatAnalysisDocsSnapshot,
  batchIndex,
}: UpdateBatchAnalysisArgs) {
  // Save data to firestore
  if (recentChatAnalysisDocsSnapshot.docs.length === 1) {
    // First analysis
    const analysisDocRef = recentChatAnalysisDocsSnapshot.docs[0].ref

    // Update analysis
    for (const participant in analysis) {
      const participantAnalysis = analysis[participant]

      // Query participant where default name = participant
      const participantDocSnapshot = await analysisDocRef
        .collection("participants")
        .where("defaultName", "==", participant)
        .limit(1)
        .get()

      if (participantDocSnapshot.docs.length > 0) {
        // Update existing participant analysis
        const participantDocRef = participantDocSnapshot.docs[0].ref

        let mergedParticipantAnalysis = participantAnalysis

        if (batchIndex !== 0) {
          mergedParticipantAnalysis = await mergeParticipantAnalyses({
            participantAnalysis,
            participantDocumentReference: participantDocRef,
          })
        }

        const participantData = prepareParticipantData(
          mergedParticipantAnalysis,
          {},
          "None"
        )
        await participantDocRef.update(participantData)
      } else {
        // Create new participant analysis
        const participantData = prepareParticipantData(
          participantAnalysis,
          {},
          "None"
        )

        await analysisDocRef.collection("participants").add({
          name: participant,
          defaultName: participant,
          aiMismatch: true,
          isNew: true,
          ...participantData,
        })

        await analysisDocRef.update({
          totalParticipants: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    }
  } else {
    // Second analysis
    const currAnalysisDocRef = recentChatAnalysisDocsSnapshot.docs[0].ref
    const prevAnalysisDocRef = recentChatAnalysisDocsSnapshot.docs[1].ref

    // Update analysis
    for (const participant in analysis) {
      const participantAnalysis = analysis[participant]

      // Query previous participants analysis
      const currParticipantDocSnapshot = await currAnalysisDocRef
        .collection("participants")
        .where("defaultName", "==", participant)
        .limit(1)
        .get()

      const prevParticipantDocSnapshot = await prevAnalysisDocRef
        .collection("participants")
        .where("defaultName", "==", participant)
        .limit(1)
        .get()

      if (
        currParticipantDocSnapshot.docs.length !== 0 &&
        prevParticipantDocSnapshot.docs.length !== 0
      ) {
        const currParticipantDocRef = currParticipantDocSnapshot.docs[0].ref

        // Get comparison data
        const prevChatParticipantAnalysis =
          prevParticipantDocSnapshot.docs[0].data() as AIChatParticipantAnalysis

        let mergedParticipantAnalysis = participantAnalysis

        if (batchIndex !== 0) {
          mergedParticipantAnalysis = await mergeParticipantAnalyses({
            participantAnalysis,
            participantDocumentReference: currParticipantDocRef,
          })
        }

        // Calculate percentage changes
        const percentageChanges = {
          Sarcasm: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Sarcasm"),
            prevChatParticipantAnalysis.sarcasmConfidence
          ),
          "Conversation Initiation Rate": calculatePercentageChange(
            findCategoryConfidence(
              mergedParticipantAnalysis,
              "Conversation Initiation Rate"
            ),
            prevChatParticipantAnalysis.conversationInitiationRate
          ),
          "Engagement Score": calculatePercentageChange(
            findCategoryConfidence(
              mergedParticipantAnalysis,
              "Engagement Score"
            ),
            prevChatParticipantAnalysis.engagementScore
          ),
          Toxic: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Toxic"),
            prevChatParticipantAnalysis.toxicConfidence
          ),
          Drugs: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Drugs"),
            prevChatParticipantAnalysis.drugsConfidence
          ),
          Romantic: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Romantic"),
            prevChatParticipantAnalysis.romanticConfidence
          ),
          Profanity: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Profanity"),
            prevChatParticipantAnalysis.profanityConfidence
          ),
          Politics: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Politics"),
            prevChatParticipantAnalysis.politicsConfidence
          ),
          Finance: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Finance"),
            prevChatParticipantAnalysis.financeConfidence
          ),
          Humor: calculatePercentageChange(
            findCategoryConfidence(mergedParticipantAnalysis, "Humor"),
            prevChatParticipantAnalysis.humorConfidence
          ),
        }

        const participantData = prepareParticipantData(
          mergedParticipantAnalysis,
          percentageChanges,
          prevChatParticipantAnalysis.personality
        )

        await currParticipantDocRef.update(participantData)
      } else if (currParticipantDocSnapshot.docs.length !== 0) {
        // Not found in prev prev but is in prev(curr)
        const currParticipantDocRef = currParticipantDocSnapshot.docs[0].ref

        let mergedParticipantAnalysis = participantAnalysis

        if (batchIndex !== 0) {
          mergedParticipantAnalysis = await mergeParticipantAnalyses({
            participantAnalysis,
            participantDocumentReference: currParticipantDocRef,
          })
        }

        const participantData = prepareParticipantData(
          mergedParticipantAnalysis,
          {},
          "None"
        )

        await currParticipantDocRef.update({
          isNew: true,
          ...participantData,
        })
      } else {
        // Create new participant analysis - not found in prev prev or prev(curr)
        const participantData = prepareParticipantData(
          participantAnalysis,
          {},
          "None"
        )

        await currAnalysisDocRef.collection("participants").add({
          name: participant,
          defaultName: participant,
          aiMismatch: true,
          isNew: true,
          ...participantData,
        })

        await currAnalysisDocRef.update({
          totalParticipants: FieldValue.increment(1),
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    }
  }
}

const AIChatAnalysis = async ({
  userId,
  chatId,
  userAnalysisId,
  fileAnalysisId,
  numSegments,
}: AIChatAnalysisArgs): Promise<number> => {
  // Query two most recent analyses
  const recentChatAnalysisDocsSnapshot = await firestore
    .collection("users")
    .doc(userId)
    .collection("chats")
    .doc(chatId)
    .collection("analyses")
    .orderBy("createdAt", "desc")
    .limit(2)
    .get()

  // There must be at least one analyses
  if (recentChatAnalysisDocsSnapshot.docs.length === 0) {
    throw new Error("No chat analyses found")
  }

  // Initialize Vertex with your Cloud project and location
  const vertexAI = new VertexAI({
    project: process.env.VERTEX_AI_PROJECT!,
    location: process.env.VERTEX_AI_LOCATION!,
  })

  // Instantiate the model
  const generativeModel = vertexAI.getGenerativeModel({
    model: process.env.VERTEX_AI_MODEL!,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 2,
      topP: 0.95,
    },
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ],
  })

  const startTime = Date.now() // Start time in milliseconds

  const numBatches = Math.ceil(numSegments / MIN_SEGMENTS_PER_BATCH) // Calculate batches based on minimum batch size
  const segmentsPerBatch = Math.ceil(numSegments / numBatches)
  let successfulResults = 0
  let longestBatchTime = 0 // Track the longest time it takes to process a batch
  const personalityCounts: Record<string, Record<string, number>> = {}

  for (let batchIndex = 0; batchIndex < numBatches; batchIndex++) {
    const batchStart = batchIndex * segmentsPerBatch + 1
    const batchEnd = Math.min((batchIndex + 1) * segmentsPerBatch, numSegments)

    const batchPromises: Promise<AIChatAnalysis>[] = []
    const analysesResults: AIChatAnalysis[] = []

    for (
      let segmentIndex = batchStart;
      segmentIndex <= batchEnd;
      segmentIndex++
    ) {
      batchPromises.push(
        analyzeSegment({
          generativeModel,
          userId,
          fileAnalysisId,
          segmentIndex,
          recentChatAnalysisDocsSnapshot,
        })
      )
    }

    const batchStartTime = Date.now() // Start time for the current batch

    // Process this batch using Promise.allSettled
    const settledResults = await Promise.allSettled(batchPromises)

    // Track the time taken for this batch
    const batchProcessingTime = (Date.now() - batchStartTime) / 1000 // Convert to seconds
    if (batchProcessingTime > longestBatchTime) {
      longestBatchTime = batchProcessingTime
    }

    // Check if there's enough time left to process the next batch
    const elapsedTime = (Date.now() - startTime) / 1000 // Total elapsed time in seconds
    if (elapsedTime + longestBatchTime >= MAX_PROCESSING_TIME) {
      posthogClient.capture({
        distinctId: userId,
        event: "Analysis Break",
        properties: {
          segments: numSegments,
          batchIndex,
          elapsedTime,
          longestBatchTime,
          progress: (batchIndex + 1) / numBatches,
        },
      })

      // Update progress
      await firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(userAnalysisId)
        .update({
          progress: 1,
        })

      break // Stop further processing
    }

    // Filter out successful results
    settledResults.forEach((result) => {
      if (result.status === "fulfilled" && result.value) {
        analysesResults.push(result.value)
        successfulResults++
      }
    })

    // Combine all analyses
    const batchAnalysis = combineAnalysesResults({
      results: analysesResults,
      personalityCounts,
    })

    // Process this batch
    await updateBatchAnalysis({
      analysis: batchAnalysis,
      recentChatAnalysisDocsSnapshot,
      batchIndex,
    })

    // Update progress
    await firestore
      .collection("users")
      .doc(userId)
      .collection("chats")
      .doc(chatId)
      .collection("analyses")
      .doc(userAnalysisId)
      .update({
        progress: (batchIndex + 1) / numBatches,
      })
  }

  return successfulResults / numSegments
}

export default AIChatAnalysis
