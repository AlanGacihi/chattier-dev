import { firestore } from "@/firebase/admin"
import {
  getShareChatAnalysisFromDocRef,
  getShareFromDocSnap,
} from "@/types/parse_data"
import { format } from "date-fns"
import {
  FieldValue,
  DocumentSnapshot,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore"
import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "./trpc"

export const shareRouter = router({
  // Get share ID
  generateId: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, analysisId } = input
      const { user } = ctx

      const userId = user.uid

      const chatDocRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const chatDoc = await chatDocRef.get()

      if (!chatDoc.exists) {
        throw new Error("Chat not found")
      }

      const chatData = chatDoc.data()!

      const analysisDocRef = chatDocRef.collection("analyses").doc(analysisId)

      const analysisDoc = await analysisDocRef.get()

      if (!analysisDoc.exists) {
        throw new Error("Chat Analysis not found")
      }

      const analysisData = analysisDoc.data()!

      const shareCollectionRef = firestore.collection("shares")

      const batch = firestore.batch()

      const newShareDocRef = shareCollectionRef.doc()
      batch.set(newShareDocRef, {
        id: newShareDocRef.id,
        userId: userId,
        chatId: chatId,
        title: `${chatData.title}: ${format(
          analysisData.startDate.toDate() as Date,
          "MMMM d, yyyy"
        )} - ${format(analysisData.endDate.toDate() as Date, "MMMM d, yyyy")}`,
        analysis: {
          id: analysisDocRef.id,
          ...analysisData,
        },
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      })

      const participantsCollectionRef =
        analysisDocRef.collection("participants")
      const participantsSnapshot = await participantsCollectionRef.get()

      participantsSnapshot.forEach((participantDoc) => {
        const participantData = participantDoc.data()
        const newParticipantDocRef = newShareDocRef
          .collection("participants")
          .doc()
        batch.set(newParticipantDocRef, participantData)
      })

      batch.update(analysisDocRef, { shareId: newShareDocRef.id })

      batch.commit()

      return { shareId: newShareDocRef.id }
    }),

  // Update share ID
  updateId: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
        shareId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { chatId, analysisId, shareId } = input
      const { user } = ctx

      const userId = user.uid

      const chatDocRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)

      const chatDoc = await chatDocRef.get()

      if (!chatDoc.exists) {
        throw new Error("Chat not found")
      }

      const chatData = chatDoc.data()!

      const analysisDocRef = chatDocRef.collection("analyses").doc(analysisId)

      const analysisDoc = await analysisDocRef.get()

      if (!analysisDoc.exists) {
        throw new Error("Chat Analysis not found")
      }

      const analysisData = analysisDoc.data()!
      const shareDocRef = firestore.collection("shares").doc(shareId)

      const batch = firestore.batch()

      batch.set(
        shareDocRef,
        {
          analysis: {
            id: analysisDocRef.id,
            ...analysisData!,
          },
          title: `${chatDoc.data()!.title}: ${format(
            analysisData!.startDate.toDate() as Date,
            "PPP"
          )} - ${format(analysisData!.endDate.toDate() as Date, "PPP")}`,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      const participantsCollectionRef =
        analysisDocRef.collection("participants")
      const participantsSnapshot = await participantsCollectionRef.get()

      const shareParticipantsCollectionRef =
        shareDocRef.collection("participants")

      const existingParticipantsSnapshot =
        await shareParticipantsCollectionRef.get()
      existingParticipantsSnapshot.forEach((participantDoc) => {
        batch.delete(shareParticipantsCollectionRef.doc(participantDoc.id))
      })

      participantsSnapshot.forEach((participantDoc) => {
        const userData = participantDoc.data()
        const newParticipantRef = shareParticipantsCollectionRef.doc()
        batch.set(newParticipantRef, userData)
      })

      batch.commit()

      return { shareId: shareDocRef.id }
    }),

  // Get share link ID
  getId: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        analysisId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx
      const { chatId, analysisId } = input

      const userId = user.uid

      const docRef = firestore
        .collection("users")
        .doc(userId)
        .collection("chats")
        .doc(chatId)
        .collection("analyses")
        .doc(analysisId)

      const doc = await docRef.get()

      if (doc.exists && doc.data()?.shareId) {
        return doc.data()?.shareId as string
      } else {
        return null
      }
    }),

  // Get users shared links
  getUserLinks: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, cursor } = input
      const { user } = ctx

      const sharesCollectionRef = firestore.collection("shares")

      let sharesQuery = sharesCollectionRef
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(limit + 1)

      if (cursor) {
        const cursorDoc = await sharesCollectionRef.doc(cursor).get()
        if (cursorDoc.exists) {
          sharesQuery = sharesQuery.startAfter(cursorDoc)
        }
      }

      const sharesSnapshot = await sharesQuery.get()
      const shares = sharesSnapshot.docs.map((shareDoc) =>
        getShareFromDocSnap(shareDoc)
      )

      let nextCursor: typeof cursor | undefined = undefined
      if (shares.length > limit) {
        const nextItem = shares.pop()
        nextCursor = nextItem?.id
      }

      return { shares, nextCursor }
    }),

  // Get share chat analysis
  getChatAnalysis: publicProcedure
    .input(
      z.object({
        shareId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const { shareId } = input

      const shareDocRef = firestore.collection("shares").doc(shareId)

      const shareChatAnalysis = await getShareChatAnalysisFromDocRef(
        shareDocRef
      )

      return shareChatAnalysis
    }),

  // Delete a share
  deleteById: privateProcedure
    .input(
      z.object({
        shareId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { shareId } = input
      const { user } = ctx

      const userId = user.uid

      const shareDocRef = firestore.collection("shares").doc(shareId)

      const shareDoc = await shareDocRef.get()

      await deleteShare({ userId, shareDoc })
    }),

  // Delete all user shares
  deleteAll: privateProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx
    const userId = user.uid

    const sharesCollectionRef = firestore.collection("shares")
    const userSharesQuery = sharesCollectionRef.where("userId", "==", userId)

    const snapshot = await userSharesQuery.get()

    const deletePromises = snapshot.docs.map((shareDoc) =>
      deleteShare({ userId, shareDoc })
    )

    await Promise.all(deletePromises)
  }),
})

interface DeleteShareArgs {
  userId: string
  shareDoc: DocumentSnapshot | QueryDocumentSnapshot
}

const deleteShare = async ({ userId, shareDoc }: DeleteShareArgs) => {
  const batch = firestore.batch()
  const { chatId, analysis } = shareDoc.data()!
  const analysisId = analysis.id

  const analysisRef = firestore
    .collection("users")
    .doc(userId)
    .collection("chats")
    .doc(chatId)
    .collection("analyses")
    .doc(analysisId)

  batch.update(analysisRef, {
    shareId: FieldValue.delete(),
  })

  // Delete participants subcollection
  const participantsRef = shareDoc.ref.collection("participants")
  const participantsSnapshot = await participantsRef.get()
  participantsSnapshot.docs.forEach((participantDoc) => {
    batch.delete(participantDoc.ref)
  })

  await batch.commit()

  await shareDoc.ref.delete()
}
