import { FieldValue } from "firebase-admin/firestore"
import { User } from "firebase/auth"

export interface ExtendedUser extends Partial<User> {
  uid: string
  name: string
  totalChats: number
  totalAnalyses: number
  defaultName?: string
  publicKey?: string
  lemonSqueezySubscriptionId?: string
  lemonSqueezyCustomerId?: string
  lemonSqueezyProductId?: string
  lemonSqueezyVariantId?: string
  lemonSqueezyCurrentPeriodRenewsAt?: Date
  lemonSqueezyPeriodEndsAt?: Date | null
  lemonSqueezyStatus?: string
  createdAt: Date
  updatedAt: Date
}

export type Chat = {
  id: string
  title: string
  totalAnalyses: number
  startDate: Date
  showStartDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}

export type ChatAnalysis = {
  id: string
  participants: ChatParticipant[]
  totalPartcipants: number
  totalParticipantsPercentageChange: number
  totalWords: number
  totalWordsPercentageChange: number
  startDate: Date
  endDate: Date
  duration: number
  durationPercentageChange: number
  status: "COMPLETE" | "PENDING" | "ERROR"
  progress: number
  shareId?: string
  createdAt: Date
  updatedAt: Date
}

export type ChatParticipant = {
  id: string
  name: string
  defaultName: string
  isPrimary: boolean
  aiMismatch: boolean
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
  isNew: boolean
  prevAnalysisDocRefId?: string
  totalEmojis: number
  blocks: {
    timeStamp: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

export type Share = {
  id: string
  userId: string
  chatId: string
  title: string
  participants?: ChatParticipant[]
  createdAt: Date | FieldValue
  updatedAt: Date | FieldValue
}
