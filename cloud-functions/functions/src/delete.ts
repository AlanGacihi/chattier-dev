import { storage } from "./config"
import { DeleteFilesArgs } from "./types"

const deleteFiles = async ({
  userId,
  fileAnalysisId,
}: DeleteFilesArgs): Promise<void> => {
  const bucket = storage.bucket("chattier-7b9f0")
  const encryptedDir = `encrypted/${userId}/${fileAnalysisId}/`
  const decryptedDir = `decrypted/${userId}/${fileAnalysisId}/`
  const analysesDir = `analyses/${userId}/${fileAnalysisId}/`

  // delete all files
  await Promise.all([
    bucket.deleteFiles({ prefix: encryptedDir }),
    bucket.deleteFiles({ prefix: decryptedDir }),
    bucket.deleteFiles({ prefix: analysesDir }),
  ])
}

export default deleteFiles
