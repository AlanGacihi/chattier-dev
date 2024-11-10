import * as readline from "readline"
import { calculatePercentageChange, formatChatLine, parseDate } from "./utils"
import { stopWords } from "./stop_words"

import {
  Chat,
  ChatParticipantAnalysis,
  ChatParticipantCompleteAnalysis,
  ChatStatsAnalysis,
  ParticipantStats,
} from "./types"
import {
  CHAT_STARTERS,
  LINES_PER_SEGMENT,
  MAX_CHAT_PARTICIPANTS,
  MAX_FAVOURITE_EMOJIS,
  MAX_FAVOURITE_WORDS,
  MINIMUM_MESSAGES,
} from "./constants"

import {
  DocumentData,
  FieldValue,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore"
import { firestore, storage } from "./config"

interface CalculateChatStatisticsArgs {
  userId: string
  chatId?: string
  fileAnalysisId: string
}

/**
 * Represents the reference to chat statistics.
 * @typedef {Object} ChatStatisticsReference
 * @property {string} chatId - The ID of the chat.
 * @property {string} analysisId - The ID of the analysis related to the chat.
 * @property {number} numSegments - The number of segments in the chat analysis.
 */
interface ChatStatisticsReferenceData {
  chatId: string
  analysisId: string
  numSegments: number
}

/**
 * Calculates statistics for a chat.
 * @param {CalculateChatStatisticsArgs} params - The parameters for the calculation.
 * @param {string} params.userId - The ID of the user requesting the statistics.
 * @param {string} [params.chatId] - The optional ID of the chat to calculate statistics for.
 * @returns {Promise<ChatStatisticsReference>} A promise that resolves to an object containing the chat statistics reference.
 */
const calculateChatStatistics = async ({
  userId,
  chatId,
  fileAnalysisId,
}: CalculateChatStatisticsArgs): Promise<ChatStatisticsReferenceData> => {
  const participantsStats: { [key: string]: ParticipantStats } = {}
  let chatDocId: string | null = null
  let analysisDocId: string | null = null
  let numSegments = 1
  let lineCount = 0
  let totalMessages = 0
  let numParticipants = 0
  let currentSegment = ""
  let currentParticipant: string = ""
  let startTime: Date = new Date()
  let analysisCutoffDate: Date | null = null
  let isCutOff = false
  let endTime: Date = new Date()
  let totalWords = 0
  let totalDeletedMessages = 0
  const blocks: { blockee: string; timeStamp: Date }[] = []
  let primaryFound = false
  let bookmarkTime: Date = new Date()
  let chatTitle = ""
  let isPrevLineEmpty = false
  let isOnNextLineMessage = false

  const bucket = storage.bucket("chattier-7b9f0")
  const inputFile = bucket.file(
    `decrypted/${userId}/${fileAnalysisId}/_chat.txt`
  )

  // Fetch bookmark
  if (chatId) {
    const chatDocRef = firestore
      .collection("users")
      .doc(userId)
      .collection("chats")
      .doc(chatId)

    const chatDocSnap = await chatDocRef.get()
    if (!chatDocSnap.exists) {
      throw new Error(
        "The requested chat could not be found. It may have been deleted."
      )
    }

    const chat = chatDocSnap.data() as Chat

    bookmarkTime = chat.endDate.toDate()
    analysisCutoffDate = chat.analysisCutoffDate
      ? chat.analysisCutoffDate.toDate()
      : null
  } else {
    // check  for analysis cutoff

    const newCuttoffChatDocRef = firestore
      .collection("new_cutt_off_chats")
      .doc(userId)
    const snapshot = await newCuttoffChatDocRef.get()

    if (snapshot.exists) {
      const cutoffData = snapshot.data()!
      analysisCutoffDate = cutoffData.analysisCutoffDate.toDate()
    }

    newCuttoffChatDocRef.delete()
  }

  // Statistical analysis
  const inputFileStream = inputFile.createReadStream()
  const rl = readline.createInterface({
    input: inputFileStream,
    crlfDelay: Infinity,
  })

  for await (const line of rl) {
    // Apple format: [DD/MM/YYYY, HH:MM:SS] Name: message
    const appleFormatMatch = line.match(
      /^\u200E?\[(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$/u
    )

    // Apple format: D/M/YY, H:MM AM/PM - Name: message
    const androidFormatMatch = line.match(
      /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s(?:AM|PM))?)\s-\s([^:]+):\s(.*)$/
    )

    // Check if either format matches
    const match = appleFormatMatch || androidFormatMatch
    if (match) {
      const [_, dateTimeStr, participantName, message] = match
      const messageTime = parseDate(dateTimeStr)
      isOnNextLineMessage = false

      // check cut off
      if (analysisCutoffDate) {
        if (messageTime > analysisCutoffDate) {
          isCutOff = true
          break
        }
      }

      if (totalMessages === 0) {
        chatTitle = participantName
        startTime = messageTime
        endTime = messageTime

        // Set start
        if (chatId) {
          if (startTime > bookmarkTime) {
            bookmarkTime = startTime
          } else {
            startTime = bookmarkTime
          }
        }

        // Get chat title
        let starterFound = false
        for (const starter of CHAT_STARTERS) {
          if (message.includes(starter)) {
            starterFound = true
            break
          }
        }

        if (starterFound) {
          continue
        }
      }

      // Get chat title
      let starterFound = false
      for (const starter of CHAT_STARTERS) {
        if (message.includes(starter)) {
          starterFound = true
          break
        }
      }
      if (starterFound) {
        chatTitle = participantName
        startTime = messageTime
        endTime = messageTime

        // Set start
        if (chatId) {
          if (startTime > bookmarkTime) {
            bookmarkTime = startTime
          } else {
            startTime = bookmarkTime
          }
        }

        continue
      }

      // Skip messages before bookmark
      if (chatId) {
        if (messageTime < bookmarkTime) {
          continue
        }
      }

      // Skip irrelevant messages
      if (message.includes("<Media omitted>") || message === "null") {
        continue
      }

      totalMessages++

      // New chat
      if (currentParticipant === "") {
        currentParticipant = participantName
      } else {
        if (!isPrevLineEmpty && currentSegment) currentSegment += "\n"
      }

      // New participant
      if (!participantsStats[participantName]) {
        if (Object.keys(participantsStats).length > MAX_CHAT_PARTICIPANTS) {
          throw new Error(
            `Please upload a chat with fewer participant. Maximum allowed is ${MAX_CHAT_PARTICIPANTS}.`
          )
        }

        participantsStats[participantName] = {
          totalResponseTime: 0,
          totalResponses: 0,
          totalWords: 0,
          totalDeletedMessages: 0,
          lastMessageTime: chatId ? bookmarkTime : startTime,
          words: {},
          emojis: {},
          isPrimary: false,
        }

        // Set primary participant
        if (!primaryFound) {
          if (participantName.startsWith("~")) {
            participantsStats[participantName].isPrimary = true
            primaryFound = true
          }
        }

        if (chatTitle.startsWith("~")) {
          chatTitle = participantName
        }
      }

      // Skip reserved messages
      if (line.startsWith("\u200E")) {
        participantsStats[participantName].lastMessageTime = messageTime
        endTime = messageTime
        isPrevLineEmpty = true
        continue
      }

      // Set participant
      const participantStats = participantsStats[participantName]

      // Check if participant has changed
      if (currentParticipant !== participantName) {
        const responseTime =
          (messageTime.getTime() -
            participantsStats[participantName].lastMessageTime.getTime()) /
          1000

        if (responseTime > 0) {
          participantStats.totalResponseTime += responseTime
          participantStats.totalResponses += 1
        }

        currentParticipant = participantName
      }

      // Clean message
      const cleanMessage = message.replace(/\u200E/g, "")

      // Non-Specific Messages
      if (
        message.length === cleanMessage.length ||
        cleanMessage.includes("<This message was edited>")
      ) {
        if (
          cleanMessage.includes("You deleted this message") ||
          cleanMessage.includes("This message was deleted")
        ) {
          participantStats.totalDeletedMessages += 1
          totalDeletedMessages += 1
          isPrevLineEmpty = true
        } else if (
          cleanMessage.includes("You blocked this business") ||
          cleanMessage.includes("You blocked this contact")
        ) {
          blocks.push({ blockee: participantName, timeStamp: messageTime })
          isPrevLineEmpty = true
        } else {
          const _cleanMessage = cleanMessage.replace(
            "<This message was edited>",
            ""
          )

          // Extract emojis
          const emojis = _cleanMessage.match(
            /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu
          )
          if (emojis) {
            emojis.forEach((emoji) => {
              if (participantStats.emojis[emoji]) {
                participantStats.emojis[emoji] += 1
              } else {
                participantStats.emojis[emoji] = 1
              }
            })
          }

          // Extract words
          const words = _cleanMessage.split(/\s+/)
          words.forEach((word) => {
            const cleanWord = word
              .trim()
              .normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .replace(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu, "")
              .replace(/[^a-z0-9']/gi, "")
              .replace(/[’'ʻʹ]/g, "'")
              .toLowerCase()
            if (cleanWord.length < 2 || stopWords.has(cleanWord.toLowerCase()))
              return

            if (participantStats.words[cleanWord])
              participantStats.words[cleanWord] += 1
            else participantStats.words[cleanWord] = 1
          })

          participantStats.totalWords += words.length
          totalWords += words.length

          // Append to current segment
          currentSegment += formatChatLine(line)

          lineCount++
          isPrevLineEmpty = false
        }
      } else {
        if (
          cleanMessage === "You deleted this message." ||
          cleanMessage === "This message was deleted."
        ) {
          participantStats.totalDeletedMessages += 1
          totalDeletedMessages += 1
        } else if (
          cleanMessage === "You blocked this business" ||
          cleanMessage === "You blocked this contact"
        ) {
          blocks.push({ blockee: participantName, timeStamp: messageTime })
        }

        isPrevLineEmpty = true
      }

      endTime = messageTime
    } else {
      // Message continues next line
      const appleFormatMatch = line.match(/^(?!\u200E)(.*)$/u)

      const androidFormatMatch = line.match(
        /^(?!(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s?(?:AM|PM)?)\s-\s)).*/
      )

      const match = appleFormatMatch || androidFormatMatch
      if (match) {
        const message = match[1]
        isOnNextLineMessage = true

        if (!currentParticipant || !message) {
          continue
        }

        const participantStats = participantsStats[currentParticipant]

        // Clean message
        const cleanMessage = message.replace(
          /\u200E<This message was edited>/g,
          ""
        )

        // Emojis
        const emojis = cleanMessage.match(
          /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu
        )
        if (emojis) {
          emojis.forEach((emoji) => {
            if (participantStats.emojis[emoji]) {
              participantStats.emojis[emoji] += 1
            } else {
              participantStats.emojis[emoji] = 1
            }
          })
        }

        // Words
        const words = cleanMessage.split(/\s+/)
        words.forEach((word) => {
          const cleanWord = word
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu, "")
            .replace(/[^a-z0-9']/gi, "")
            .replace(/[’'ʻʹ]/g, "'")
            .toLowerCase()
          if (cleanWord.length < 2 || stopWords.has(cleanWord.toLowerCase())) {
            return
          }

          if (participantStats.words[cleanWord]) {
            participantStats.words[cleanWord] += 1
          } else {
            participantStats.words[cleanWord] = 1
          }
        })

        participantStats.totalWords += words.length
        totalWords += words.length

        // Append to current Segment
        currentSegment += line.replace(/\u200E<This message was edited>/g, "")
        currentSegment += " "
        lineCount++
      }
    }

    // Write a new segment
    if (!isOnNextLineMessage && lineCount >= LINES_PER_SEGMENT) {
      const outputFile = bucket.file(
        `analyses/${userId}/${fileAnalysisId}/segment${numSegments}.txt`
      )
      const outputFileStream = outputFile.createWriteStream()
      outputFileStream.write(currentSegment)
      outputFileStream.end("\n")
      numSegments++
      lineCount = 0
      currentSegment = ""
    }
  }

  // Save any remaining lines in the last segment
  if (currentSegment) {
    const outputFile = bucket.file(
      `analyses/${userId}/${fileAnalysisId}/segment${numSegments}.txt`
    )
    const outputFileStream = outputFile.createWriteStream()
    outputFileStream.write(currentSegment)
    outputFileStream.end("\n")
  }

  // Destroy input file stream
  inputFileStream.destroy()

  // Remove invalid participant
  if (Object.keys(participantsStats).length > 2) {
    if (participantsStats[chatTitle]) {
      delete participantsStats[chatTitle]
    }
  }

  // Set numParticipants
  numParticipants = Object.keys(participantsStats).length

  // Check if processing occurred
  if (
    !currentParticipant ||
    totalWords === 0 ||
    numParticipants === 0 ||
    totalMessages < MINIMUM_MESSAGES
  ) {
    let baseMessage = "The chat does not contain enough messages for analysis."

    if (chatId) {
      baseMessage +=
        " Continue chatting or consider deleting the most recent chat analytics."
    } else if (isCutOff) {
      baseMessage =
        "The analysis cutoff date is too recent. Please select an later cutoff date to include more messages."
    } else {
      baseMessage +=
        " Continue the conversation to provide more data for analysis."
    }

    throw new Error(baseMessage)
  }

  // Set chat title if no set
  if (!chatTitle) {
    for (const participantName in participantsStats) {
      if (!participantsStats[participantName].isPrimary) {
        chatTitle = participantName
        break
      }
    }
  }

  // Analysis duration
  let duration: number = 0
  let updateEndTime = new Date(endTime)

  if (isCutOff) {
    updateEndTime = analysisCutoffDate!
  }

  // Save data to firestore
  const userDocRef = firestore.collection("users").doc(userId)

  // Increment total analyses
  await userDocRef.update({
    totalAnalyses: FieldValue.increment(1),
  })

  const chatDocRef = chatId
    ? userDocRef.collection("chats").doc(chatId)
    : userDocRef.collection("chats").doc()

  let prevchatAnalysis: QuerySnapshot<DocumentData> | null = null

  if (chatId) {
    // Get previous analysis data only if chatId is defined
    const prevchatAnalysisDocs = chatDocRef
      .collection("analyses")
      .orderBy("createdAt", "desc")
      .limit(1)
    prevchatAnalysis = await prevchatAnalysisDocs.get()
  }

  if (!prevchatAnalysis || prevchatAnalysis.empty) {
    // Increment total chats
    await userDocRef.update({
      totalChats: FieldValue.increment(1),
    })

    // Create new chat
    chatDocId = chatDocRef.id
    await chatDocRef.set({
      title: chatTitle,
      totalAnalyses: 1,
      startDate: Timestamp.fromDate(startTime),
      showStartDate: Timestamp.fromDate(startTime),
      endDate: Timestamp.fromDate(updateEndTime),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies Chat)

    duration = (updateEndTime.getTime() - startTime.getTime()) / 1000

    const chatAnalysisDocRef = chatDocRef.collection("analyses").doc()
    await chatAnalysisDocRef.set({
      totalParticipants: numParticipants,
      totalParticipantsPercentageChange: 0,
      totalWords: totalWords,
      totalWordsPercentageChange: 0,
      startDate: Timestamp.fromDate(startTime),
      endDate: Timestamp.fromDate(updateEndTime),
      duration: duration,
      durationPercentageChange: 0,
      status: "PENDING",
      progress: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies ChatStatsAnalysis)
    analysisDocId = chatAnalysisDocRef.id

    // Add participants
    const chatAnalysisParticipantsCollection =
      chatAnalysisDocRef.collection("participants")
    for (const participantName in participantsStats) {
      const participantStats = participantsStats[participantName]

      // Calculate average and percentage
      const averageResponseTime =
        participantStats.totalResponses > 0
          ? participantStats.totalResponseTime / participantStats.totalResponses
          : 0
      const chattierConfidence =
        totalWords > 0 ? participantStats.totalWords / totalWords : 0

      // sort words
      const sortedWords = Object.entries(participantStats.words).sort(
        (a, b) => b[1] - a[1]
      )
      participantStats.words = Object.fromEntries(sortedWords)

      // sort emojis
      const sortedEmojis = Object.entries(participantStats.emojis).sort(
        (a, b) => b[1] - a[1]
      )

      await chatAnalysisParticipantsCollection.add({
        name: participantName,
        defaultName: participantName,
        isPrimary: participantStats.isPrimary,
        chattierConfidence: chattierConfidence,
        chattierPercentageChange: 0,
        averageResponseTime: averageResponseTime,
        averageResponseTimePercentageChange: 0,
        deletedMessages: participantStats.totalDeletedMessages,
        totalDeletedMessages: totalDeletedMessages,
        deletedMessagesPercentageChange: 0,
        favoriteWords: sortedWords
          .slice(0, MAX_FAVOURITE_WORDS)
          .map((word) => word[0]),
        favoriteEmojis: sortedEmojis
          .slice(0, MAX_FAVOURITE_EMOJIS)
          .map((emoji) => emoji[0]),
        words: participantStats.totalWords,
        totalWords: totalWords,
        wordsPercentageChange: 0,
        totalBlocks: blocks.length,
        blocks: blocks.filter((block) => block.blockee !== participantName),
        blocksPercentageChange: 0,
        isNew: false,
        totalEmojis: sortedEmojis.length,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies ChatParticipantAnalysis)
    }
  } else {
    // Update existing chat
    await chatDocRef.update({
      totalAnalyses: FieldValue.increment(1),
      endDate: Timestamp.fromDate(updateEndTime),
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies Partial<Chat>)
    chatDocId = chatDocRef.id

    const prevchatAnalysisDoc = prevchatAnalysis.docs[0]
    const prevchatAnalysisData = prevchatAnalysisDoc.data() as ChatStatsAnalysis
    if (!prevchatAnalysisData) {
      throw new Error(
        "Unable to retrieve previous analysis data. The data may be corrupted or in an unexpected format."
      )
    }

    // Calculate chat percentage changes
    const totalParticipantsPercentageChange = calculatePercentageChange(
      numParticipants,
      prevchatAnalysisData.totalParticipants
    )
    const totalWordsPercentageChange = calculatePercentageChange(
      totalWords,
      prevchatAnalysisData.totalWords
    )
    const durationPercentageChange = calculatePercentageChange(
      duration,
      prevchatAnalysisData.duration
    )

    duration = (updateEndTime.getTime() - bookmarkTime.getTime()) / 1000

    const chatAnalysisDocRef = chatDocRef.collection("analyses").doc()
    await chatAnalysisDocRef.set({
      totalParticipants: numParticipants,
      totalParticipantsPercentageChange: totalParticipantsPercentageChange,
      totalWords: totalWords,
      totalWordsPercentageChange: totalWordsPercentageChange,
      startDate: Timestamp.fromDate(bookmarkTime),
      endDate: Timestamp.fromDate(updateEndTime),
      duration: duration,
      durationPercentageChange: durationPercentageChange,
      status: "PENDING",
      progress: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies ChatStatsAnalysis)
    analysisDocId = chatAnalysisDocRef.id

    // Add participants
    const prevchatAnalysisParticipantsCollection =
      prevchatAnalysisDoc.ref.collection("participants")
    const newchatAnalysisParticipantsCollection =
      chatAnalysisDocRef.collection("participants")
    for (const participantName in participantsStats) {
      const participantStats = participantsStats[participantName]

      // Calculate current average and percentage
      const currentAverageResponseTime =
        participantStats.totalResponses > 0
          ? participantStats.totalResponseTime / participantStats.totalResponses
          : 0
      const currentChattierConfidence =
        totalWords > 0 ? participantStats.totalWords / totalWords : 0

      // sort words
      const sortedWords = Object.entries(participantStats.words).sort(
        (a, b) => b[1] - a[1]
      )
      participantStats.words = Object.fromEntries(sortedWords)

      // sort emojis
      const sortedEmojis = Object.entries(participantStats.emojis).sort(
        (a, b) => b[1] - a[1]
      )

      // Get previous participantName data
      const prevParticipantAnalysis =
        await prevchatAnalysisParticipantsCollection
          .where("defaultName", "==", participantName)
          .limit(1)
          .get()
      if (prevParticipantAnalysis.empty) {
        // Add new participanst analysis
        await newchatAnalysisParticipantsCollection.add({
          name: participantName,
          defaultName: participantName,
          isPrimary: participantStats.isPrimary,
          chattierConfidence: currentChattierConfidence,
          chattierPercentageChange: 0,
          averageResponseTime: currentAverageResponseTime,
          averageResponseTimePercentageChange: 0,
          totalDeletedMessages: totalDeletedMessages,
          deletedMessages: participantStats.totalDeletedMessages,
          deletedMessagesPercentageChange: 0,
          favoriteWords: sortedWords
            .slice(0, MAX_FAVOURITE_WORDS)
            .map((word) => word[0]),
          favoriteEmojis: sortedEmojis
            .slice(0, MAX_FAVOURITE_EMOJIS)
            .map((emoji) => emoji[0]),
          words: participantStats.totalWords,
          totalWords: totalWords,
          wordsPercentageChange: 0,
          totalBlocks: blocks.length,
          blocks: blocks.filter((block) => block.blockee !== participantName),
          blocksPercentageChange: 0,
          isNew: true,
          prevAnalysisDocRefId: prevchatAnalysisDoc.ref.id,
          totalEmojis: sortedEmojis.length,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        } satisfies ChatParticipantAnalysis)
      } else {
        // Compare with existing participant
        const prevParticipantAnalysisDoc = prevParticipantAnalysis.docs[0]
        const prevParticipantAnalysisData =
          prevParticipantAnalysisDoc.data() as ChatParticipantCompleteAnalysis
        if (!prevParticipantAnalysisData) {
          throw new Error(
            "Unable to retrieve previous participant analysis data. The data may be missing or in an unexpected format."
          )
        }

        // Calculate participant percentage changes
        const chattierPercentageChange = calculatePercentageChange(
          currentChattierConfidence,
          prevParticipantAnalysisData.chattierConfidence
        )
        const wordsPercentageChange = calculatePercentageChange(
          participantStats.totalWords,
          prevParticipantAnalysisData.words
        )
        const averageResponseTimePercentageChange = calculatePercentageChange(
          currentAverageResponseTime,
          prevParticipantAnalysisData.averageResponseTime
        )
        const deletedMessagesPercentageChange = calculatePercentageChange(
          participantStats.totalDeletedMessages,
          prevParticipantAnalysisData.deletedMessages
        )
        const blocksPercentageChange = calculatePercentageChange(
          blocks.filter((block) => block.blockee !== participantName).length,
          prevParticipantAnalysisData.blocks.length
        )

        await newchatAnalysisParticipantsCollection
          .doc(prevParticipantAnalysisDoc.id)
          .set({
            name: participantName,
            defaultName: participantName,
            isPrimary: participantStats.isPrimary,
            chattierConfidence: currentChattierConfidence,
            chattierPercentageChange: chattierPercentageChange,
            averageResponseTime: currentAverageResponseTime,
            averageResponseTimePercentageChange:
              averageResponseTimePercentageChange,
            deletedMessages: participantStats.totalDeletedMessages,
            totalDeletedMessages: totalDeletedMessages,
            deletedMessagesPercentageChange: deletedMessagesPercentageChange,
            favoriteWords: sortedWords
              .slice(0, MAX_FAVOURITE_WORDS)
              .map((word) => word[0]),
            favoriteEmojis: sortedEmojis
              .slice(0, MAX_FAVOURITE_EMOJIS)
              .map((emoji) => emoji[0]),
            words: participantStats.totalWords,
            totalWords: totalWords,
            wordsPercentageChange: wordsPercentageChange,
            blocks: blocks.filter((block) => block.blockee !== participantName),
            totalBlocks: blocks.length,
            blocksPercentageChange: blocksPercentageChange,
            isNew: false,
            totalEmojis: sortedEmojis.length,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          } satisfies ChatParticipantAnalysis)
      }
    }
  }

  return {
    chatId: chatDocId,
    analysisId: analysisDocId,
    numSegments: numSegments,
  }
}

export default calculateChatStatistics
