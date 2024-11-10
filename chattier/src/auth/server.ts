import "server-only"

import { cookies } from "next/headers"
import { ExtendedUser } from "../types/types"
import { auth, firestore } from "@/firebase/admin"
import { SESSION_EXPIRATION_TIMEOUT } from "@/lib/constants"
import { getUserFromDoc } from "@/types/parse_data"

// /**
//  * Sends a password reset email to the specified email address.
//  *
//  * @param {Object} params - The parameters for the function.
//  * @param {string} params.email - The email address to send the password reset to.
//  * @returns {Promise<boolean>} - Returns `true` if the email was sent successfully, otherwise `false`.
//  */
// export const sendPasswordResetToEmail = async ({
//   email,
// }: {
//   email: string
// }): Promise<boolean> => {
//   try {
//     // Construct the request body
//     const requestBody = {
//       requestType: "PASSWORD_RESET",
//       email: email,
//     }

//     // Make the API call to Firebase Admin SDK
//     const response = await axios.post(
//       "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode",
//       requestBody,
//       {
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${admin.credential
//             .applicationDefault()
//             .getAccessToken()}`,
//         },
//       }
//     )

//     // Handle the response
//     if (response.status === 200) {
//       // Password reset email sent successfully
//       return true
//     } else {
//       // Error sending password reset email
//       console.error("Password reset email failed:", response.data)
//       return false
//     }
//   } catch (error) {
//     console.error("Error sending password reset email:", error)
//     return false
//   }
// }

/**
 * Verifies the out-of-band (OOB) code provided for password reset or email verification.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.oobCode - The OOB code to verify.
 * @returns {Promise<boolean>} - Returns `true` if the OOB code is valid, otherwise `false`.
 */
export const verifyOobCode = async ({
  oobCode,
}: {
  oobCode: string
}): Promise<boolean> => {
  return false
}

/**
 * Sets a session cookie for the authenticated user.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.idToken - The ID token of the authenticated user.
 * @returns {Promise<void>} - Returns `void`.
 */
export async function setSession({
  idToken,
}: {
  idToken: string
}): Promise<void> {
  try {
    // Verify the ID token
    await auth.verifyIdToken(idToken)

    // Create a session cookie
    const expiresIn = SESSION_EXPIRATION_TIMEOUT
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

    // Set the session cookie
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    })
  } catch (e) {
    console.error("Failed to create session:", e)
  }
}

/**
 * Clears the session cookie and revokes the user's refresh tokens.
 *
 * @returns {Promise<void>} - Returns `void`.
 */
export async function clearSession(): Promise<void> {
  try {
    const cookieStore = cookies()

    // Clear the session cookie
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })

    const sessionCookie = cookieStore.get("session")?.value
    if (sessionCookie) {
      const decodedClaims = await auth.verifySessionCookie(sessionCookie)
      await auth.revokeRefreshTokens(decodedClaims.sub)
    }
  } catch (e) {
    console.error("Failed to clear session:", e)
  }
}

/**
 * Gets a custom token for the currently authenticated user.
 *
 * @returns {Promise<string | null>} - Returns a custom token if the user is authenticated, otherwise `null`.
 */
export async function getUserToken(): Promise<string | null> {
  const user = await getCurrentUser()
  if (!user) {
    return null
  }

  const customToken = await auth.createCustomToken(user.uid)
  return customToken
}

/**
 * Gets the currently authenticated user from the session cookie.
 *
 * @returns {Promise<ExtendedUser | null>} - Returns the authenticated user if one exists, otherwise `null`.
 */
export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const cookieStore = cookies()
  const session = cookieStore.get("session")?.value

  if (!session) {
    return null
  }

  try {
    // Verify the session cookie and get the claims
    const decodedClaims = await auth.verifySessionCookie(session, true)

    // Get the user from Firebase Admin
    const user = await auth.getUser(decodedClaims.uid)

    // Get data from db
    const userRef = firestore.collection("users").doc(user.uid)

    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return null
    }

    const extendedUser = getUserFromDoc(userDoc, user)

    return extendedUser
  } catch (error) {
    console.error("Failed to verify session.")
    return null
  }
}
