import { getApp, getApps, initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFunctions } from "firebase/functions"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

/**
 * Firebase configuration object.
 *
 * The configuration values are loaded from environment variables:
 * - `NEXT_PUBLIC_FIREBASE_API_KEY`: The API key for Firebase.
 * - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: The authentication domain for Firebase.
 * - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: The Firebase project ID.
 * - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`: The storage bucket URL for Firebase.
 * - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`: The sender ID for Firebase messaging.
 * - `NEXT_PUBLIC_FIREBASE_APP_ID`: The application ID for Firebase.
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

/**
 * Firebase application instance.
 *
 * Initializes the Firebase app if no existing apps are found. Otherwise, it retrieves
 * the existing app instance.
 */
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

/**
 * Firebase Authentication instance.
 *
 * Provides access to Firebase Authentication services.
 */
const auth = getAuth(app)

/**
 * Firebase Functions instance.
 *
 * Provides access to Firebase Cloud Functions.
 */
const functions = getFunctions(app, "europe-west2")

/**
 * Firebase Firestore instance.
 *
 * Provides access to Firebase Firestore for database operations.
 */
const db = getFirestore(app)

const storage = getStorage(app, "gs://chattier-7b9f0")

export { auth, functions, storage }
