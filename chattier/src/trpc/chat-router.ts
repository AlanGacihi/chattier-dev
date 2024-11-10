import { firestore } from "@/firebase/admin"
import { getChatFromDoc } from "@/types/parse_data"
import { FieldValue, Timestamp } from "firebase-admin/firestore"
import { z } from "zod"
import { privateProcedure, router } from "./trpc"

export const chatRouter = router({
  // Update chat title
  updateChatTitle: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        newTitle: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, newTitle } = input

      const userId = user.uid

      const docRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      await docRef.update({
        title: newTitle.trim(),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }),

  // Update the bookmark time
  updateAnalysisCutoffDate: privateProcedure
    .input(
      z.object({
        chatId: z.string().nullish(),
        cutoffDate: z.date().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, cutoffDate } = input

      const userId = user.uid

      // Set the cutoffDate to 23:59:59 PM
      if (cutoffDate) {
        cutoffDate.setHours(23, 59, 59, 999)
      }

      if (chatId) {
        const docRef = firestore
          .collection("users")
          .doc(userId)
          .collection("chats")
          .doc(chatId)

        await docRef.update({
          analysisCutoffDate: cutoffDate
            ? Timestamp.fromDate(cutoffDate)
            : null,
          updatedAt: FieldValue.serverTimestamp(),
        })
      } else {
        const newCutoffChatDocRef = firestore
          .collection("new_cutt_off_chats")
          .doc(userId)

        if (cutoffDate) {
          await newCutoffChatDocRef.set({
            analysisCutoffDate: Timestamp.fromDate(cutoffDate),
          })
        } else {
          await newCutoffChatDocRef.delete()
        }
      }
    }),

  // Fetch user chats
  getUserChats: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const { user } = ctx

      const userId = user.uid
      const chatsCollectionRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")

      let chatsQuery = chatsCollectionRef
        .orderBy("createdAt", "desc")
        .limit(limit + 1)

      if (cursor) {
        const cursorDoc = await chatsCollectionRef.doc(cursor).get()
        if (cursorDoc.exists) {
          chatsQuery = chatsQuery.startAfter(cursorDoc)
        }
      }

      const chatsSnapshot = await chatsQuery.get()

      const chats = chatsSnapshot.docs.map((chatDoc) => getChatFromDoc(chatDoc))

      let nextCursor: typeof cursor | undefined = undefined
      if (chats.length > limit) {
        const nextItem = chats.pop()
        nextCursor = nextItem?.id
      }

      return { chats, nextCursor }
    }),

  // Get chat timiings
  getChatTimings: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId } = input

      const userId = user.uid

      const docRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const doc = await docRef.get()

      const chat = getChatFromDoc(doc)

      return {
        showStartDate: chat.showStartDate,
        endDate: chat.endDate,
      }
    }),

  // Delete chat
  deleteChat: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId } = input

      const userId = user.uid

      const chatRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const analysesSnapshot = await chatRef.collection("analyses").get()

      for (const analysisDoc of analysesSnapshot.docs) {
        const analysisRef = analysisDoc.ref
        const analysisData = analysisDoc.data()!

        if (analysisData.shareId) {
          const shareRef = firestore
            .collection("shares")
            .doc(analysisData.shareId)

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

        participantsSnapshot.docs.forEach((userDoc) => {
          batch.delete(userDoc.ref)
        })

        await batch.commit()

        await analysisRef.delete()
      }

      await chatRef.delete()
    }),
})
