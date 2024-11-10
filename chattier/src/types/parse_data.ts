import { calculatePercentageChange } from "@/lib/utils"
import {
  Chat,
  ChatAnalysis,
  ChatParticipant,
  ExtendedUser,
  Share,
} from "@/types/types"
import { UserRecord } from "firebase-admin/auth"
import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore"
import { User } from "firebase/auth"

export function getUserFromDoc(
  userDocument: DocumentSnapshot<DocumentData>,
  user: User | UserRecord
): ExtendedUser {
  const data = userDocument.data()!

  return {
    ...user,
    name: data.name as string,
    totalChats: data.totalChats as number,
    totalAnalyses: data.totalAnalyses as number,
    defaultName: data.defaultName as string | undefined,
    publicKey: data.publicKey as string | undefined,
    lemonSqueezySubscriptionId: data.lemonSqueezySubscriptionId as
      | string
      | undefined,
    lemonSqueezyCustomerId: data.lemonSqueezyCustomerId as string | undefined,
    lemonSqueezyProductId: data.lemonSqueezyProductId as string | undefined,
    lemonSqueezyVariantId: data.lemonSqueezyVariantId as string | undefined,
    lemonSqueezyCurrentPeriodRenewsAt:
      data.lemonSqueezyCurrentPeriodRenewsAt?.toDate() as Date | undefined,
    lemonSqueezyPeriodEndsAt: data.lemonSqueezyPeriodEndsAt
      ? (data.lemonSqueezyPeriodEndsAt.toDate() as Date | null)
      : null,
    lemonSqueezyStatus: data.lemonSqueezyStatus as string | undefined,
    updatedAt: data.updatedAt.toDate() as Date,
    createdAt: data.createdAt.toDate() as Date,
  } satisfies ExtendedUser
}

export function getChatFromDoc(
  chatDocument:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>
): Chat {
  const data = chatDocument.data()!

  return {
    id: chatDocument.id,
    title: data.title as string,
    totalAnalyses: data.totalAnalyses as number,
    startDate: data.startDate.toDate() as Date,
    showStartDate: data.showStartDate.toDate() as Date,
    endDate: data.endDate.toDate() as Date,
    createdAt: data.createdAt.toDate() as Date,
    updatedAt: data.updatedAt.toDate() as Date,
  } satisfies Chat
}

export function getChatAnalysisFromDocSnap(
  analysisDocument:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>
): ChatAnalysis {
  const data = analysisDocument.data()!

  return {
    id: analysisDocument.id,
    participants: [],
    totalPartcipants: data.totalParticipants as number,
    totalParticipantsPercentageChange:
      data.totalParticipantsPercentageChange as number,
    totalWords: data.totalWords as number,
    totalWordsPercentageChange: data.totalWordsPercentageChange as number,
    startDate: data.startDate.toDate() as Date,
    endDate: data.endDate.toDate() as Date,
    duration: data.duration as number,
    durationPercentageChange: data.durationPercentageChange as number,
    status: data.status as "COMPLETE" | "PENDING" | "ERROR",
    progress: data.progress as number,
    createdAt: data.createdAt.toDate() as Date,
    updatedAt: data.updatedAt.toDate() as Date,
  } satisfies ChatAnalysis
}

export function getShareFromDocSnap(
  shareDocument:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>
): Share {
  const data = shareDocument.data()!

  return {
    id: shareDocument.id,
    userId: data.userId as string,
    chatId: data.chatId as string,
    title: data.title as string,
    createdAt: data.createdAt.toDate() as Date,
    updatedAt: data.updatedAt.toDate() as Date,
  } satisfies Share
}

export async function getChatAnalysisFromDocRef(
  analysisDocument: DocumentReference<DocumentData>
): Promise<ChatAnalysis> {
  const participantsCollectionRef = analysisDocument.collection("participants")

  // Fetch analysis data
  const analysisSnapshot = await analysisDocument.get()
  const analysisData = analysisSnapshot.data()

  if (!analysisData) {
    throw new Error("Analysis document not found")
  }

  // Fetch participants data
  const participantsSnapshot = await participantsCollectionRef.get()
  const participantsData = await Promise.all(
    participantsSnapshot.docs.map((participantDoc) =>
      getChatPartcipantFromDoc(participantDoc)
    )
  )

  // Sort participants based on isPrimary
  participantsData.sort((a, b) => (a.isPrimary ? -1 : 1))

  // Construct and return the ChatAnalysis object
  return {
    id: analysisDocument.id,
    participants: participantsData as ChatParticipant[],
    totalPartcipants: participantsData.length,
    totalParticipantsPercentageChange:
      analysisData.totalParticipantsPercentageChange as number,
    totalWords: analysisData.totalWords as number,
    totalWordsPercentageChange:
      analysisData.totalWordsPercentageChange as number,
    startDate: analysisData.startDate.toDate() as Date,
    endDate: analysisData.endDate.toDate() as Date,
    duration: analysisData.duration as number,
    durationPercentageChange: analysisData.durationPercentageChange as number,
    status: analysisData.status as "COMPLETE" | "PENDING" | "ERROR",
    progress: analysisData.progress as number,
    createdAt: analysisData.createdAt.toDate() as Date,
    updatedAt: analysisData.updatedAt.toDate() as Date,
  } satisfies ChatAnalysis
}

export async function getShareChatAnalysisFromDocRef(
  shareDocument: DocumentReference<DocumentData>
): Promise<ChatAnalysis> {
  const participantsCollectionRef = shareDocument.collection("participants")

  const shareSnapshot = await shareDocument.get()
  const shareData = shareSnapshot.data()

  if (!shareData) {
    throw new Error("Share document not found")
  }

  const participantsSnapshot = await participantsCollectionRef.get()
  const participantsData = await Promise.all(
    participantsSnapshot.docs.map((participantDoc) =>
      getChatPartcipantFromDoc(participantDoc)
    )
  )

  return {
    id: shareData.analysis.id as string,
    participants: participantsData as ChatParticipant[],
    totalPartcipants: participantsData.length,
    totalParticipantsPercentageChange: shareData.analysis
      .totalparticipantsPercentageChange as number,
    totalWords: shareData.analysis.totalWords as number,
    totalWordsPercentageChange: shareData.analysis
      .totalWordsPercentageChange as number,
    startDate: shareData.analysis.startDate.toDate() as Date,
    endDate: shareData.analysis.endDate.toDate() as Date,
    duration: shareData.analysis.duration as number,
    durationPercentageChange: shareData.analysis
      .durationPercentageChange as number,
    status: shareData.analysis.status as "COMPLETE" | "PENDING" | "ERROR",
    progress: shareData.analysis.progress as number,
    createdAt: shareData.analysis.createdAt.toDate() as Date,
    updatedAt: shareData.analysis.updatedAt.toDate() as Date,
  } satisfies ChatAnalysis
}

export async function getChatPartcipantsFromDoc(
  analysisDocument: DocumentReference<DocumentData>
) {
  const participantsCollectionRef = analysisDocument.collection("participants")

  const participantsSnapshot = await participantsCollectionRef.get()

  return Promise.all(
    participantsSnapshot.docs.map((participantDoc) =>
      getChatPartcipantFromDoc(participantDoc)
    )
  )
}

export function getChatPartcipantFromDoc(
  participantDocument:
    | DocumentSnapshot<DocumentData>
    | QueryDocumentSnapshot<DocumentData>
): ChatParticipant {
  const data = participantDocument.data()!

  return {
    id: participantDocument.id,
    name: (data.name as string) ?? "",
    defaultName: (data.defaultName as string) ?? "",
    aiMismatch: (data.aiMismatch as boolean) ?? false,
    isPrimary: (data.isPrimary as boolean) ?? false,
    chattierConfidence: (data.chattierConfidence as number) ?? 0,
    chattierPercentageChange: (data.chattierPercentageChange as number) ?? 0,
    averageResponseTime: (data.averageResponseTime as number) ?? 0,
    averageResponseTimePercentageChange:
      (data.averageResponseTimePercentageChange as number) ?? 0,
    deletedMessages: (data.deletedMessages as number) ?? 0,
    totalDeletedMessages: (data.totalDeletedMessages as number) ?? 0,
    deletedMessagesPercentageChange:
      (data.deletedMessagesPercentageChange as number) ?? 0,
    favoriteWords: (data.favoriteWords as string[]) ?? [],
    favoriteEmojis: (data.favoriteEmojis as string[]) ?? [],
    words: (data.words as number) ?? 0,
    totalWords: (data.totalWords as number) ?? 0,
    wordsPercentageChange: (data.wordsPercentageChange as number) ?? 0,
    totalBlocks: (data.totalBlocks as number) ?? 0,
    sarcasmConfidence: (data.sarcasmConfidence as number) ?? 0,
    sarcasmConfidencePercentageChange:
      (data.sarcasmConfidencePercentageChange as number) ?? 0,
    conversationInitiationRate:
      (data.conversationInitiationRate as number) ?? 0,
    conversationInitiationRatePercentageChange:
      (data.conversationInitiationRatePercentageChange as number) ?? 0,
    engagementScore: (data.engagementScore as number) ?? 0,
    engagementScorePercentageChange:
      (data.engagementScorePercentageChange as number) ?? 0,
    blocksPercentageChange: (data.blocksPercentageChange as number) ?? 0,
    toxicConfidence: (data.toxicConfidence as number) ?? 0,
    toxicConfidencePercentageChange:
      (data.toxicConfidencePercentageChange as number) ?? 0,
    drugsConfidence: (data.drugsConfidence as number) ?? 0,
    drugsConfidencePercentageChange:
      (data.drugsConfidencePercentageChange as number) ?? 0,
    romanticConfidence: (data.romanticConfidence as number) ?? 0,
    romanticConfidencePercentageChange:
      (data.romanticConfidencePercentageChange as number) ?? 0,
    profanityConfidence: (data.profanityConfidence as number) ?? 0,
    profanityConfidencePercentageChange:
      (data.profanityConfidencePercentageChange as number) ?? 0,
    politicsConfidence: (data.politicsConfidence as number) ?? 0,
    politicsConfidencePercentageChange:
      (data.politicsConfidencePercentageChange as number) ?? 0,
    financeConfidence: (data.financeConfidence as number) ?? 0,
    financeConfidencePercentageChange:
      (data.financeConfidencePercentageChange as number) ?? 0,
    humorConfidence: (data.humorConfidence as number) ?? 0,
    humorConfidencePercentageChange:
      (data.humorConfidencePercentageChange as number) ?? 0,
    personality: (data.personality as string) ?? "None",
    previousPersonality: (data.previousPersonality as string) ?? "None",
    isNew: (data.isNew as boolean) ?? false,
    prevAnalysisDocRefId: data.prevAnalysisDocRefId as string | undefined,
    blocks: (
      (data.blocks as { timeStamp: { toDate: () => Date } }[]) ?? []
    ).map((block: any) => ({
      timeStamp: block.timeStamp.toDate(),
    })),
    totalEmojis: (data.totalEmojis as number) ?? 0,
    createdAt: (data.createdAt?.toDate() as Date) ?? new Date(),
    updatedAt: (data.updatedAt?.toDate() as Date) ?? new Date(),
  } satisfies ChatParticipant
}

export function getPercentageChangesUpdateData(
  prevParticipant: ChatParticipant,
  currentParticipant: ChatParticipant
): Partial<ChatParticipant> {
  return {
    sarcasmConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.sarcasmConfidence,
      prevParticipant.sarcasmConfidence
    ),
    conversationInitiationRatePercentageChange: calculatePercentageChange(
      currentParticipant.conversationInitiationRate,
      prevParticipant.conversationInitiationRate
    ),
    engagementScorePercentageChange: calculatePercentageChange(
      currentParticipant.engagementScore,
      prevParticipant.engagementScore
    ),
    toxicConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.toxicConfidence,
      prevParticipant.toxicConfidence
    ),
    drugsConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.drugsConfidence,
      prevParticipant.drugsConfidence
    ),
    romanticConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.romanticConfidence,
      prevParticipant.romanticConfidence
    ),
    profanityConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.profanityConfidence,
      prevParticipant.profanityConfidence
    ),
    politicsConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.politicsConfidence,
      prevParticipant.politicsConfidence
    ),
    financeConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.financeConfidence,
      prevParticipant.financeConfidence
    ),
    humorConfidencePercentageChange: calculatePercentageChange(
      currentParticipant.humorConfidence,
      prevParticipant.humorConfidence
    ),
    wordsPercentageChange: calculatePercentageChange(
      currentParticipant.words,
      prevParticipant.words
    ),
    blocksPercentageChange: calculatePercentageChange(
      currentParticipant.totalBlocks,
      prevParticipant.totalBlocks
    ),
    deletedMessagesPercentageChange: calculatePercentageChange(
      currentParticipant.deletedMessages,
      prevParticipant.deletedMessages
    ),
    chattierPercentageChange: calculatePercentageChange(
      currentParticipant.chattierConfidence,
      prevParticipant.chattierConfidence
    ),
    averageResponseTimePercentageChange: calculatePercentageChange(
      currentParticipant.averageResponseTime,
      prevParticipant.averageResponseTime
    ),
    previousPersonality: prevParticipant.personality,
  } satisfies Partial<ChatParticipant>
}

export function getAIMismatchUpdateData(
  sourceParticipant: ChatParticipant
): Partial<ChatParticipant> {
  return {
    sarcasmConfidence: sourceParticipant.sarcasmConfidence,
    conversationInitiationRate: sourceParticipant.conversationInitiationRate,
    engagementScore: sourceParticipant.engagementScore,
    drugsConfidence: sourceParticipant.drugsConfidence,
    romanticConfidence: sourceParticipant.romanticConfidence,
    profanityConfidence: sourceParticipant.profanityConfidence,
    politicsConfidence: sourceParticipant.politicsConfidence,
    financeConfidence: sourceParticipant.financeConfidence,
    humorConfidence: sourceParticipant.humorConfidence,
    personality: sourceParticipant.personality,
  } satisfies Partial<ChatParticipant>
}
