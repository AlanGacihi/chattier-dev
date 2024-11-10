import { GenerativeModel } from "@google-cloud/vertexai"
import {
  DocumentReference,
  FieldValue,
  QuerySnapshot,
  Timestamp,
} from "firebase-admin/firestore"
import { z } from "zod"

export interface AnalyzeChatLogArgs {
  chatId?: string
  fileAnalysisId: string
}

export interface AnalyzeChatLogResult {
  chatId: string
  analysisId: string
}

export interface AIChatAnalysisArgs {
  userId: string
  chatId: string
  userAnalysisId: string
  fileAnalysisId: string
  numSegments: number
}

export interface DecryptFileArgs {
  userId: string
  fileAnalysisId: string
}

export interface DeleteFilesArgs {
  userId: string
  fileAnalysisId: string
}

export interface CombineAnalysesResultsArgs {
  results: AIChatAnalysis[]
  personalityCounts: Record<string, Record<string, number>>
}

export interface AnalyzeSegmentArgs {
  generativeModel: GenerativeModel
  userId: string
  fileAnalysisId: string
  segmentIndex: number
  recentChatAnalysisDocsSnapshot: QuerySnapshot
}

export interface MergeParticipantAnalysesArgs {
  participantAnalysis: ParticipantAnalysis
  participantDocumentReference: DocumentReference
}

export interface UpdateBatchAnalysisArgs {
  analysis: AIChatAnalysis
  recentChatAnalysisDocsSnapshot: QuerySnapshot
  batchIndex: number
}

export type ParticipantStats = {
  totalResponseTime: number
  totalResponses: number
  totalWords: number
  totalDeletedMessages: number
  lastMessageTime: Date
  words: Record<string, number>
  emojis: Record<string, number>
  isPrimary: boolean
}

export type Chat = {
  title: string
  totalAnalyses: number | FieldValue
  startDate: Timestamp
  showStartDate: Timestamp
  endDate: Timestamp
  analysisCutoffDate?: Timestamp | null
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}

export type ChatStatsAnalysis = {
  totalParticipants: number
  totalParticipantsPercentageChange: number
  totalWords: number
  totalWordsPercentageChange: number
  startDate: Timestamp | FieldValue
  endDate: Timestamp | FieldValue
  duration: number
  durationPercentageChange: number
  status: "COMPLETE" | "PENDING" | "ERROR"
  progress: number
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}

export type ChatParticipantAnalysis = {
  name: string
  defaultName: string
  isPrimary: boolean
  chattierConfidence: number
  chattierPercentageChange: number
  averageResponseTime: number
  averageResponseTimePercentageChange: number
  deletedMessages: number
  totalDeletedMessages: number
  deletedMessagesPercentageChange: number
  favoriteWords: string[]
  favoriteEmojis: string[]
  words: number
  totalWords: number
  wordsPercentageChange: number
  totalBlocks: number
  blocksPercentageChange: number
  isNew: boolean
  prevAnalysisDocRefId?: string
  blocks: {
    timeStamp: Date
  }[]
  totalEmojis: number
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}

export type AIChatParticipantAnalysis = {
  sarcasmConfidence: number
  sarcasmConfidencePercentageChange: number
  conversationInitiationRate: number
  conversationInitiationRatePercentageChange: number
  engagementScore: number
  engagementScorePercentageChange: number
  toxicConfidence: number
  toxicConfidencePercentageChange: number
  drugsConfidence: number
  drugsConfidencePercentageChange: number
  romanticConfidence: number
  romanticConfidencePercentageChange: number
  profanityConfidence: number
  profanityConfidencePercentageChange: number
  politicsConfidence: number
  politicsConfidencePercentageChange: number
  financeConfidence: number
  financeConfidencePercentageChange: number
  humorConfidence: number
  humorConfidencePercentageChange: number
  personality: string
  previousPersonality: string
  defaultName?: string
  name?: string
  isNew?: boolean
  aiMismatch?: boolean
  updatedAt: Timestamp | FieldValue
}

export type ChatParticipantCompleteAnalysis = ChatParticipantAnalysis &
  AIChatParticipantAnalysis

export type AnalysisTrigger = {
  userId: string
  chatId: string
  numSegments: number
  status: "PENDING" | "INPROGRESS" | "COMPLETE" | "ERROR"
  userAnalysisId: string
  fileAnalysisId: string
  calculateStatsDuration: number
  aiAnalysisDuration: number
  aiAccuracy: number
  originalChatEndDate: Timestamp | null
  expiresAt: Timestamp
  createdAt: FieldValue | Timestamp
  updatedAt: FieldValue | Timestamp
}

/**
 * Type definition for a function that executes a promise executor.
 *
 * @typedef {Function} PromiseExecutor
 * @param {Function} resolve - The function to call with the resolved value.
 * @param {Function} reject - The function to call with the rejection reason.
 * @template T - The type of the resolved value.
 */
export type PromiseExecutor<T> = (
  resolve: (value: T) => void,
  reject: (reason?: any) => void
) => void

const ConfidenceSchema = z
  .number()
  .min(0)
  .max(1)
  .transform((val) => Number(val.toFixed(2)))

const ParticipantAnalysisSchema = z.object({
  categories: z.array(
    z.union([
      z.object({
        name: z.enum([
          "Toxic",
          "Drugs",
          "Romantic",
          "Profanity",
          "Politics",
          "Finance",
          "Humor",
          "Sarcasm",
          "Conversation Initiation Rate",
          "Engagement Score",
        ]),
        confidence: ConfidenceSchema,
      }),
      z.object({
        name: z.literal("Personality"),
        value: z.string(),
      }),
    ])
  ),
})

export const AIAnalysisSchema = z.record(z.string(), ParticipantAnalysisSchema)

export type ParticipantAnalysis = z.infer<typeof ParticipantAnalysisSchema>

export type AIChatAnalysis = z.infer<typeof AIAnalysisSchema>
