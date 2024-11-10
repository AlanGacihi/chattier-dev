import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"
import { getDatabase } from "firebase-admin/database"

/**
 * Initializes the Firebase Admin SDK if it hasn't been initialized already.
 *
 * This function checks if there are any existing Firebase apps initialized. If none are found,
 * it initializes the Firebase Admin SDK with the provided credentials and database URL.
 *
 * The credentials are loaded from environment variables:
 * - `FIREBASE_PROJECT_ID`: The Firebase project ID.
 * - `FIREBASE_CLIENT_EMAIL`: The service account client email.
 * - `FIREBASE_PRIVATE_KEY`: The private key for the service account (with escaped newline characters).
 * - `FIREBASE_DATABASE_URL`: The URL of the Firebase Realtime Database.
 */
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  })
}

const auth = getAuth()
const firestore = getFirestore()
const database = getDatabase()

export { auth, firestore, database }
