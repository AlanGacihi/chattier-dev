import { FieldValue, Timestamp } from "firebase-admin/firestore"

import { firestore } from "@/firebase/admin"
import {
  getAIMismatchUpdateData,
  getChatAnalysisFromDocRef,
  getChatAnalysisFromDocSnap,
  getChatFromDoc,
  getChatPartcipantFromDoc,
  getChatPartcipantsFromDoc,
  getPercentageChangesUpdateData,
} from "@/types/parse_data"
import { ChatParticipant } from "@/types/types"
import { z } from "zod"
import { privateProcedure, router } from "./trpc"

interface ParticipantData {
  id: string
  name: string
  defaultName: string
  isNew: boolean
}

export const analysisRouter = router({
  // Save chat participant data
  saveChatParticipantData: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        participantId: z.string(),
        numParticipants: z.number(),
        data: z.object({
          isPrimary: z.boolean().nullish(),
          name: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, analysisId, participantId, numParticipants, data } = input

      const participantsCollectionRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)
        .collection("participants")

      const participantDocRef = participantsCollectionRef.doc(participantId)

      const batch = firestore.batch()

      if (data.isPrimary === true) {
        const primaryParticipantsQuery = participantsCollectionRef.where(
          "isPrimary",
          "==",
          true
        )
        const primaryParticipantsSnapshot = await primaryParticipantsQuery.get()

        primaryParticipantsSnapshot.docs.forEach((docSnapshot) => {
          if (docSnapshot.id !== participantId) {
            batch.update(docSnapshot.ref, {
              isPrimary: false,
              updatedAt: FieldValue.serverTimestamp(),
            })
          }
        })

        batch.update(participantDocRef, {
          isPrimary: true,
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else if (data.isPrimary === false && numParticipants === 2) {
        const participantsSnapshot = await participantsCollectionRef.get()
        participantsSnapshot.docs.forEach((docSnapshot) => {
          if (docSnapshot.id !== participantId) {
            batch.update(docSnapshot.ref, {
              isPrimary: true,
              updatedAt: FieldValue.serverTimestamp(),
            })
          }
        })
      }

      const updateData: { [key: string]: any } = {}

      if (data.name?.length > 0) {
        updateData.name = data.name.trim()
      }

      if (data.isPrimary !== null) {
        updateData.isPrimary = data.isPrimary
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = FieldValue.serverTimestamp()
        batch.update(participantDocRef, updateData)
      }

      await batch.commit()
    }),

  // Get complete analyses + participants
  getUserChatAnalysis: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, analysisId } = input

      const analysisDocRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)

      const chatAnalysis = await getChatAnalysisFromDocRef(analysisDocRef)

      return chatAnalysis
    }),

  // Get the analysis - data only - no participants
  getUserChatAnalyses: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, limit, cursor } = input
      const { user } = ctx

      const analyticsCollectionRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")

      let analyticsQuery = analyticsCollectionRef
        .orderBy("createdAt", "desc")
        .limit(limit + 1)

      if (cursor) {
        const cursorDoc = await analyticsCollectionRef.doc(cursor).get()
        if (cursorDoc.exists) {
          analyticsQuery = analyticsQuery.startAfter(cursorDoc)
        }
      }

      const analyticsSnapshot = await analyticsQuery.get()
      const analyses = analyticsSnapshot.docs.map((analysisDoc) =>
        getChatAnalysisFromDocSnap(analysisDoc)
      )

      let nextCursor: typeof cursor | undefined = undefined
      if (analyses.length > limit) {
        const nextItem = analyses.pop()
        nextCursor = nextItem?.id
      }

      return { analyses, nextCursor }
    }),

  // Get data to synchorinize chat participant
  getSynchronizeChatPartcipantData: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        participantId: z.string(),
        aiMismatch: z.boolean(),
        prevAnalysisId: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { chatId, analysisId, participantId, aiMismatch, prevAnalysisId } =
        input
      const { user } = ctx

      const docRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)

      const participantsCollectionRef = docRef.collection("participants")

      const participantsSnapshot = await participantsCollectionRef.get()
      let participantsData: ParticipantData[] = participantsSnapshot.docs.map(
        (participantDoc) => ({
          id: participantDoc.id,
          name: participantDoc.data().name ?? "",
          defaultName: participantDoc.data().defaultName ?? "",
          isNew: participantDoc.data().isNew ?? false,
        })
      )

      participantsData = participantsData.filter(
        (participant) => participant.id !== participantId
      )

      if (aiMismatch) {
        return participantsData
      }

      let prevParticipantsData: ParticipantData[] = []

      if (prevAnalysisId) {
        const prevAnalysisRef = firestore
          .collection("users")
          .doc(user.uid)
          .collection("chats")
          .doc(chatId)
          .collection("analyses")
          .doc(prevAnalysisId)

        const prevAnalysisParticipants = await getChatPartcipantsFromDoc(
          prevAnalysisRef
        )

        prevParticipantsData = prevAnalysisParticipants.map((participant) => ({
          id: participant.id,
          name: participant.name,
          defaultName: participant.defaultName,
          isNew: participant.isNew,
        }))
      } else {
        const analyticsCollectionRef = firestore
          .collection("users")
          .doc(user.uid)
          .collection("chats")
          .doc(chatId)
          .collection("analyses")

        const secondLastAnalysisQuery = analyticsCollectionRef
          .orderBy("createdAt", "desc")
          .limit(2)

        const secondLastAnalysisSnapshot = await secondLastAnalysisQuery.get()

        if (secondLastAnalysisSnapshot.docs.length > 1) {
          const secondLastAnalysisId = secondLastAnalysisSnapshot.docs[1].id
          const secondLastAnalysisRef = firestore
            .collection("users")
            .doc(user.uid)
            .collection("chats")
            .doc(chatId)
            .collection("analyses")
            .doc(secondLastAnalysisId)

          const prevAnalysisParticipants = await getChatPartcipantsFromDoc(
            secondLastAnalysisRef
          )

          prevParticipantsData = prevAnalysisParticipants.map(
            (participant) => ({
              id: participant.id,
              name: participant.name,
              defaultName: participant.defaultName,
              isNew: participant.isNew,
            })
          )
        }
      }

      const mergedParticipantsData = [...prevParticipantsData]
      participantsData.forEach((participant) => {
        const index = mergedParticipantsData.findIndex(
          (u) => u.id === participant.id
        )
        if (index !== -1) {
          mergedParticipantsData[index] = {
            ...mergedParticipantsData[index],
            ...participant,
          }
        } else {
          mergedParticipantsData.push(participant)
        }
      })

      return mergedParticipantsData
    }),

  // Synchronize chat participant
  synchronizeChatPartcipantData: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        participantId: z.string(),
        targetPartcipantId: z.string(),
        aiMismatch: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const {
        chatId,
        analysisId,
        participantId,
        targetPartcipantId,
        aiMismatch,
      } = input

      const analysisRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)
      const participantsCollectionRef = analysisRef.collection("participants")

      if (aiMismatch) {
        const sourceParticipantRef =
          participantsCollectionRef.doc(participantId)
        const targetParticipantRef =
          participantsCollectionRef.doc(targetPartcipantId)

        const [sourceParticipantDoc, targetParticipantDoc] = await Promise.all([
          sourceParticipantRef.get(),
          targetParticipantRef.get(),
        ])

        if (!sourceParticipantDoc.exists) {
          throw new Error("Source participant not found")
        }

        if (!targetParticipantDoc.exists) {
          throw new Error("Target participant not found")
        }

        const sourceParticipant = getChatPartcipantFromDoc(sourceParticipantDoc)

        const updateData = getAIMismatchUpdateData(sourceParticipant)

        await targetParticipantRef.update({
          ...updateData,
          updatedAt: FieldValue.serverTimestamp(),
        })

        sourceParticipantRef.delete()
        analysisRef.update({
          totalParticipants: FieldValue.increment(-1),
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        const analyticsCollectionRef = firestore
          .collection("users")
          .doc(user.uid)
          .collection("chats")
          .doc(chatId)
          .collection("analyses")
        const secondLastAnalysisQuery = analyticsCollectionRef
          .orderBy("createdAt", "desc")
          .limit(2)
        const secondLastAnalysisSnapshot = await secondLastAnalysisQuery.get()

        if (secondLastAnalysisSnapshot.docs.length > 1) {
          const secondLastAnalysisId = secondLastAnalysisSnapshot.docs[1].id
          const secondLastAnalysisRef =
            analyticsCollectionRef.doc(secondLastAnalysisId)
          const secondLastParticipantsCollectionRef =
            secondLastAnalysisRef.collection("participants")

          const prevParticipantRef =
            secondLastParticipantsCollectionRef.doc(targetPartcipantId)
          const currentParticipantRef =
            participantsCollectionRef.doc(participantId)

          const [prevParticipantDoc, currentParticipantDoc] = await Promise.all(
            [prevParticipantRef.get(), currentParticipantRef.get()]
          )

          if (prevParticipantDoc.exists && currentParticipantDoc.exists) {
            const prevParticipant = prevParticipantDoc.data() as ChatParticipant
            const currentParticipant =
              currentParticipantDoc.data() as ChatParticipant

            const updateData = getPercentageChangesUpdateData(
              prevParticipant,
              currentParticipant
            )

            await currentParticipantRef.update({
              ...updateData,
              isNew: false,
              updatedAt: FieldValue.serverTimestamp(),
            })
          }
        }
      }
    }),

  // Delete a chat participant from chat analyses
  deleteChatPartcipant: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        participantId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, analysisId, participantId } = input

      const participantDocRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)
        .collection("participants")
        .doc(participantId)

      await participantDocRef.delete()

      const analysisDocRef = firestore
        .collection("users")
        .doc(user.uid)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)

      await analysisDocRef.update({
        totalParticipants: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }),

  // Delete chat analysis
  deleteById: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        startDate: z.date(),
        endDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, analysisId, startDate, endDate } = input
      const userId = user.uid

      const chatRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const analysisRef = chatRef.collection("analyses").doc(analysisId)

      const analysisDoc = await analysisRef.get()
      const analysis = getChatAnalysisFromDocSnap(analysisDoc)
      if (analysis.shareId) {
        const shareRef = firestore.collection("shares").doc(analysis.shareId)

        const shareParticipantsRef = shareRef.collection("participants")
        const shareParticipantsSnapshot = await shareParticipantsRef.get()

        const shareBatch = firestore.batch()
        shareParticipantsSnapshot.docs.forEach((doc) => {
          shareBatch.delete(doc.ref)
        })
        await shareBatch.commit()

        await shareRef.delete()
      }

      const participantsCollectionRef = analysisRef.collection("participants")

      const participantsSnapshot = await participantsCollectionRef.get()
      const batch = firestore.batch()

      participantsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()

      // Fetch chat document
      const chatDoc = await chatRef.get()
      const chat = getChatFromDoc(chatDoc)

      // Prepare updates object
      const updates: { [key: string]: unknown } = {
        totalAnalyses: FieldValue.increment(-1),
        updatedAt: FieldValue.serverTimestamp(),
      }

      // Update chat start time if this was the earliest shown analysis
      if (chat.showStartDate.getTime() === startDate.getTime()) {
        const nextAnalysis = await chatRef
          .collection("analyses")
          .where("createdAt", ">", analysis.createdAt)
          .orderBy("createdAt")
          .limit(1)
          .get()

        if (!nextAnalysis.empty) {
          updates.showStartDate = nextAnalysis.docs[0].data().startDate
        } else {
          // If no other analyses, reset to chat end
          updates.showStartDate = chat.startDate
        }
      }

      // Update chat end time if this was the latest analysis
      if (chat.endDate.getTime() === endDate.getTime()) {
        const prevAnalysis = await chatRef
          .collection("analyses")
          .where("createdAt", "<", analysis.createdAt)
          .orderBy("createdAt", "desc")
          .limit(1)
          .get()

        if (!prevAnalysis.empty) {
          const prevAnalysisEnd = prevAnalysis.docs[0].data().endDate
          updates.endDate = prevAnalysisEnd
        } else {
          // If no other analyses, reset to chat start
          updates.endDate = Timestamp.fromDate(chat.startDate)
        }
      }

      await analysisRef.delete()

      await chatRef.update(updates)
    }),
})
