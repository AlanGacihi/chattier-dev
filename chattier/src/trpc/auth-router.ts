import {
  clearSession,
  getCurrentUser,
  setSession,
  verifyOobCode,
} from "@/auth/server"
import { firestore } from "@/firebase/admin"
import { FieldValue } from "firebase-admin/firestore"
import { z } from "zod"
import { privateProcedure, publicProcedure, router } from "./trpc"
import ratelimit from "@/firebase/ratelimit"

export const authRouter = router({
  // Sign in with email
  signInWithEmail: publicProcedure
    .input(
      z.object({
        idToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { idToken } = input

      await setSession({ idToken })
    }),

  // Sign in with provider
  signInWithProvider: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        idToken: z.string(),
        name: z.string(),
        email: z.string().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, idToken, name, email } = input

      //check if user exists and save them then set session
      const userDocSnap = await firestore.collection("users").doc(userId).get()

      if (!userDocSnap.exists) {
        await saveUser({ id: userId, name, email })
      }

      await setSession({ idToken })
    }),

  // sign up with email
  signUpWithEmail: publicProcedure
    .input(
      z.object({
        userId: z.string(),
        idToken: z.string(),
        name: z.string(),
        email: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { userId, idToken, name, email } = input

      await saveUser({ id: userId, name, email })

      await setSession({ idToken })
    }),

  // Check user public key generation status
  checkUserPublicKeyGeneration: privateProcedure.query(async ({ ctx }) => {
    const { user } = ctx
    const userId = user.uid

    if (user.publicKey)
      return {
        success: user.publicKey !== undefined,
      }
  }),

  verifyOobCode: publicProcedure
    .input(
      z.object({
        oobCode: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { oobCode } = input

      const result = await verifyOobCode({ oobCode })

      return { success: result }
    }),

  checkRateLimit: privateProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx
    const userId = user.uid

    const { isRateLimited } = await ratelimit.isRateLimited(userId)

    return { isRateLimited }
  }),

  // Sign out
  signOut: publicProcedure.mutation(async () => {
    const user = await getCurrentUser()
    if (!user) {
      return
    }

    await clearSession()
  }),
})

/**
 * Interface representing the arguments required to save a user's information.
 */
interface SaveUserArgs {
  id: string
  name: string
  email: string | null
}

/**
 * Saves the user's information in the Firestore database, including the user's
 * name, free trial tokens, total chats, and timestamps for creation and updates.
 *
 * @param {SaveUserArgs} param0 - The user's ID and name.
 * @returns {Promise<void>} - A promise that resolves when the user's information has been successfully saved.
 */
export const saveUser = async ({
  id,
  name,
  email,
}: SaveUserArgs): Promise<void> => {
  const userRef = firestore.collection("users").doc(id)

  await userRef.set({
    name,
    email,
    totalChats: 0,
    totalAnalyses: 0,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })
}
