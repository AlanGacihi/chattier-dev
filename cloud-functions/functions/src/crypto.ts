import * as crypto from "crypto"
import * as stream from "stream"
import { promisify } from "util"

import { firestore, storage } from "./config"
import { readNBytes } from "./utils"
import { DeleteFilesArgs } from "./types"

const pipeline = promisify(stream.pipeline)

export const decryptFile = async ({
  userId,
  fileAnalysisId,
}: DeleteFilesArgs) => {
  const bucket = storage.bucket("chattier-7b9f0")
  const file = bucket.file(
    `encrypted/${userId}/${fileAnalysisId}/_chat.encrypted`
  )

  // Fetch the private key
  const privateKeyDocSnap = await firestore
    .collection("rsa_encryption_keys")
    .doc(userId)
    .get()

  if (!privateKeyDocSnap.exists) {
    console.error(`No private key found for user ${userId}`)
    return
  }

  const privateKeyPem = privateKeyDocSnap.data()!.privateKey as string
  const privateKey = crypto.createPrivateKey(privateKeyPem)

  // Create read stream
  const readStream = file.createReadStream()

  // Read the header to get lengths of encrypted AES key and IV
  const headerBuffer = await readNBytes(readStream, 8)
  const encryptedAESKeyLength = headerBuffer.readUInt32BE(0)
  const ivLength = headerBuffer.readUInt32BE(4)

  // Read the encrypted AES key and IV
  const encryptedAESKeyBuffer = await readNBytes(
    readStream,
    encryptedAESKeyLength
  )
  const iv = await readNBytes(readStream, ivLength)

  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    },
    encryptedAESKeyBuffer
  )
  const decipher = crypto.createDecipheriv("aes-256-cbc", aesKey, iv)

  // Create write stream for decrypted file
  const writeStream = bucket
    .file(`decrypted/${userId}/${fileAnalysisId}/_chat.txt`)
    .createWriteStream()

  await pipeline(readStream, decipher, writeStream)
}

export const generateRSAKeys = async ({ userId }: { userId: string }) => {
  // Generate key pair
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  })

  // Store private key in private_keys collection
  await firestore.collection("rsa_encryption_keys").doc(userId).set({
    privateKey: privateKey,
  })

  // Store public key in users collection
  await firestore.collection("users").doc(userId).update({
    publicKey: publicKey,
  })
}
