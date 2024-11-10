import { auth } from "@/firebase/client"
import { FirebaseError } from "firebase/app"
import {
  applyActionCode,
  AuthErrorCodes,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth"

interface AuthEmailArgs {
  email: string
  password: string
}

export const signInWithEmailOnClient = async ({
  email,
  password,
}: AuthEmailArgs) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    )
    const idToken = await userCredential.user.getIdToken()

    return { idToken }
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-credential":
          throw new Error("Invalid email or password.")
        case "auth/user-not-found":
          throw new Error("Invalid email or password.")
        case "auth/wrong-password":
          throw new Error("Invalid email or password.")
        case "auth/user-disabled":
          throw new Error("This account has been disabled.")
        case "auth/too-many-requests":
          throw new Error("Too many sign-in attempts. Try again in a moment.")
        case "auth/network-request-failed":
          throw new Error(
            "Network error. Please check your connection and try again."
          )
        default:
          throw new Error("An error occurred during sign-in. Please try again.")
      }
    } else {
      throw error
    }
  }
}

// sign up with email
export const signUpWithEmailOnClient = async ({
  email,
  password,
}: AuthEmailArgs) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    )

    const user = userCredential.user

    await sendEmailVerification(user, {
      url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
    })

    const idToken = await user.getIdToken()

    return { userId: user.uid, idToken }
  } catch (error) {
    if (error instanceof FirebaseError) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error(
          "The email address is already in use by another account."
        )
      }
      if (error.code === "auth/too-many-requests") {
        throw new Error("Too many requests. Try again in a moment.")
      }
      if (error.code === "auth/network-request-failed") {
        throw new Error("Network error. Try again later.")
      }

      throw new Error("Something went wrong. Try again in a moment.")
    } else {
      throw error
    }
  }
}

/**
 * Handles the social sign-in process using a given provider.
 *
 * @param {GoogleAuthProvider | OAuthProvider} provider - The authentication provider (e.g., Google, OAuth).
 */
export const handleSocialSignIn = async (
  provider: GoogleAuthProvider | OAuthProvider
) => {
  try {
    const result = await signInWithPopup(auth, provider)
    const user = result.user
    const idToken = await user.getIdToken()

    return {
      userId: user.uid,
      name: user.displayName ?? "User x",
      idToken,
      email: user.email,
    }
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/popup-closed-by-user":
          throw new Error("Sign-in was cancelled.")
          break
        case "auth/cancelled-popup-request":
          throw new Error("Sign-in was cancelled.")
          break
        case "auth/popup-blocked":
          throw new Error(
            "Sign-in popup was blocked. Please enable popups and try again."
          )
          break
        case "auth/network-request-failed":
          throw new Error(
            "Network error. Please check your connection and try again."
          )
          break
        default:
          throw new Error("Failed to sign in. Please try again.")
      }
    } else {
      throw new Error("Failed to sign in. Please try again.")
    }
  }
}

// Verify email
export const verifyEmail = async ({ oobCode }: { oobCode: string }) => {
  try {
    await applyActionCode(auth, oobCode)

    return { success: true }
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const firebaseError = error as { code: string }
      if (firebaseError.code === AuthErrorCodes.INVALID_OOB_CODE) {
        const user = auth.currentUser
        if (user) {
          try {
            await sendEmailVerification(user)
            return {
              success: false,
              message:
                "The verification link was invalid or expired. A new verification email has been sent.",
            }
          } catch (sendError) {
            return {
              success: false,
              message:
                "The verification link was invalid and we couldn't send a new one. Please try again later.",
            }
          }
        } else {
          return {
            success: false,
            message:
              "The verification link was invalid and no user is currently signed in. Please sign in and request a new verification email.",
          }
        }
      }
    }

    throw error
  }
}

export const sendPasswordResetLink = async ({ email }: { email: string }) => {
  await sendPasswordResetEmail(auth, email)
}
