import { getApp, getApps, initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getFunctions } from "firebase-admin/functions"
import { getStorage } from "firebase-admin/storage"

const app = getApps().length ? getApp() : initializeApp()

const firestore = getFirestore(app)

const functions = getFunctions(app)

const storage = getStorage(app)

export { firestore, functions, storage }
