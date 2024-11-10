import { onCall, HttpsError, onRequest } from "firebase-functions/v2/https"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { onDocumentCreated } from "firebase-functions/v2/firestore"
import { setGlobalOptions } from "firebase-functions/v2"

import AIChatAnalysis from "./ai"
import deleteFiles from "./delete"
import {
  AnalysisTrigger,
  AnalyzeChatLogArgs,
  AnalyzeChatLogResult,
  Chat,
  ChatStatsAnalysis,
  DecryptFileArgs,
  DeleteFilesArgs,
} from "./types"
import { firestore } from "./config"
import {
  triggerAwaitedHttpsFunction,
  triggerUnawaitedHttpsFunction,
  verifyAcessToken,
} from "./utils"
import { decryptFile, generateRSAKeys } from "./crypto"
import calculateChatStatistics from "./stats"
import posthogClient from "./posthog"

setGlobalOptions({ region: "europe-west2" })

export const analyzeChatLog = onCall<AnalyzeChatLogArgs>(
  {
    timeoutSeconds: 360,
  },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Unauthenticated user")
    }

    const { chatId, fileAnalysisId } = request.data
    const userId = request.auth.uid

    let originalChat: Chat | null = null

    if (chatId) {
      const chatRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const chatSnapshot = await chatRef.get()
      if (!chatSnapshot.exists) {
        throw new HttpsError("not-found", "Chat not found")
      }
      originalChat = (chatSnapshot.data() as Chat) || null
    }

    const analysesCollection = firestore.collection("analyses")
    const newAnalysisRef = analysesCollection.doc()

    const startTime = new Date()

    await newAnalysisRef.set({
      userId,
      fileAnalysisId,
      status: "PENDING",
      calculateStatsDuration: -1,
      aiAnalysisDuration: -1,
      originalChatEndDate: originalChat === null ? null : originalChat.endDate,
      // Expires one week after creation
      expiresAt: Timestamp.fromDate(
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      ),
      createdAt: Timestamp.fromDate(startTime),
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies Partial<AnalysisTrigger>)

    try {
      try {
        await triggerAwaitedHttpsFunction("decryptUserChatFile", {
          userId,
          fileAnalysisId,
        })
      } catch (e) {
        throw Error("An error occurred during chat decryption.")
      }

      const storageReferenceData = await calculateChatStatistics({
        userId,
        chatId,
        fileAnalysisId,
      })

      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000)

      await newAnalysisRef.update({
        chatId: storageReferenceData.chatId,
        numSegments: storageReferenceData.numSegments,
        userAnalysisId: storageReferenceData.analysisId,
        calculateStatsDuration: duration,
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies Partial<AnalysisTrigger>)

      triggerUnawaitedHttpsFunction("runAIAnalysis", {
        analysisId: newAnalysisRef.id,
      })

      posthogClient.capture({
        distinctId: userId,
        event: "Calculate Statistics Success",
        properties: {
          duration,
          segments: storageReferenceData.numSegments,
        },
      })

      return {
        chatId: storageReferenceData.chatId,
        analysisId: storageReferenceData.analysisId,
      } satisfies AnalyzeChatLogResult
    } catch (error) {
      triggerUnawaitedHttpsFunction("deleteUserChatFiles", {
        userId,
        fileAnalysisId,
      })

      if (chatId && originalChat) {
        const chatRef = firestore
          .collection("users")
          .doc(userId)
          .collection("chats")
          .doc(chatId)
        await chatRef.update({
          endDate: originalChat.endDate,
        } satisfies Partial<Chat>)
      }

      const duration = Math.floor((Date.now() - startTime.getTime()) / 1000)

      await newAnalysisRef.update({
        calculateStatsDuration: duration,
        status: "ERROR",
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies Partial<AnalysisTrigger>)

      posthogClient.capture({
        distinctId: userId,
        event: "Calculate Statistics Failure",
        properties: {
          duration,
          error: error instanceof Error ? error.message : error,
        },
      })

      if (error instanceof Error) {
        throw new HttpsError("internal", error.message)
      } else {
        throw new HttpsError("internal", "Failed to analyze the chat.")
      }
    }
  }
)

export const runAIAnalysis = onRequest(
  {
    timeoutSeconds: 3600,
  },
  async (request, response) => {
    verifyAcessToken(request)

    const { analysisId } = request.body as { analysisId: string }

    const analysesCollection = firestore.collection("analyses")
    const analysisRef = analysesCollection.doc(analysisId)
    const analysisDoc = await analysisRef.get()
    const analysisTrigger = analysisDoc.data()! as AnalysisTrigger

    const {
      userId,
      chatId,
      numSegments,
      userAnalysisId,
      fileAnalysisId,
      updatedAt,
      originalChatEndDate,
    } = analysisTrigger

    const chatRef = firestore
      .collection("users")
      .doc(userId)
      .collection("chats")
      .doc(chatId)
    const userAnalysisRef = chatRef.collection("analyses").doc(userAnalysisId)

    await analysisRef.update({
      status: "INPROGRESS",
      updatedAt: FieldValue.serverTimestamp(),
    } satisfies Partial<AnalysisTrigger>)

    try {
      const accuracy = await AIChatAnalysis({
        userId,
        chatId,
        userAnalysisId,
        fileAnalysisId,
        numSegments,
      })

      const duration = Math.floor(
        (Date.now() - (updatedAt as Timestamp).toDate().getTime()) / 1000
      )

      await analysisRef.update({
        aiAnalysisDuration: duration,
        aiAccuracy: accuracy,
        status: "COMPLETE",
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies Partial<AnalysisTrigger>)

      await userAnalysisRef.update({
        status: "COMPLETE",
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies Partial<ChatStatsAnalysis>)

      posthogClient.capture({
        distinctId: userId,
        event: "AI Analysis Success",
        properties: {
          duration,
          segments: numSegments,
          accuracy,
        },
      })
    } catch (error) {
      console.error("AI analysis failed:", error)

      const duration = Math.floor(
        (Date.now() - (updatedAt as Timestamp).toDate().getTime()) / 1000
      )

      await analysisRef.update({
        aiAnalysisDuration: duration,
        status: "ERROR",
        updatedAt: FieldValue.serverTimestamp(),
      } satisfies Partial<AnalysisTrigger>)

      try {
        await userAnalysisRef.update({
          status: "ERROR",
          updatedAt: FieldValue.serverTimestamp(),
        } satisfies Partial<ChatStatsAnalysis>)
      } catch {}

      try {
        if (originalChatEndDate) {
          await chatRef.update({
            endDate: originalChatEndDate,
          } satisfies Partial<Chat>)
        }
      } catch {}

      posthogClient.capture({
        distinctId: userId,
        event: "AI Analysis Failure",
        properties: {
          duration,
          segments: numSegments,
          error: error instanceof Error ? error.message : error,
        },
      })
    } finally {
      triggerUnawaitedHttpsFunction("deleteUserChatFiles", {
        userId,
        fileAnalysisId,
      })
    }
  }
)

export const onUserCreated = onDocumentCreated(
  "users/{userId}",
  async (event) => {
    const snapshot = event.data
    if (!snapshot) {
      console.log("No data associated with the event")
      return
    }

    const userId = event.params.userId

    try {
      await generateRSAKeys({ userId })
    } catch (error) {
      console.error("Error generating RSA keys:", error)

      posthogClient.capture({
        distinctId: userId,
        event: "RSA Key Generation Failure",
        properties: {
          userId,
          error: error instanceof Error ? error.message : error,
        },
      })
    }
  }
)

export const deleteUserChatFiles = onRequest(
  {
    timeoutSeconds: 360,
  },
  async (request, response) => {
    verifyAcessToken(request)

    const { userId, fileAnalysisId } = request.body as DeleteFilesArgs

    try {
      await deleteFiles({ userId, fileAnalysisId })
    } catch (error) {
      console.error("Error deleting files:", error, userId, fileAnalysisId)

      posthogClient.capture({
        distinctId: userId,
        event: "Delete Files Failure",
        properties: {
          userId,
          fileAnalysisId,
          error: error instanceof Error ? error.message : error,
        },
      })
    }
  }
)

export const decryptUserChatFile = onRequest(
  {
    timeoutSeconds: 60,
  },
  async (request, response) => {
    verifyAcessToken(request)

    const { userId, fileAnalysisId } = request.body as DecryptFileArgs

    try {
      await decryptFile({ userId, fileAnalysisId })
      response.send({ success: true })
    } catch (error) {
      console.error("Error decrypting file:", error)

      posthogClient.capture({
        distinctId: userId,
        event: "Chat Decryption Failure",
        properties: {
          error: error instanceof Error ? error.message : error,
        },
      })

      throw new HttpsError("internal", "Failed to decrypt the file.")
    }
  }
)
