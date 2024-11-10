"use server"

import { firestore } from "@/firebase/admin"
import { getShareFromDocSnap } from "@/types/parse_data"
import { Share } from "@/types/types"

/**
 * Retrieves a share document from Firestore based on the provided share ID.
 *
 * @param {Object} params - The parameters object.
 * @param {string} params.shareId - The ID of the share document to retrieve.
 * @returns {Promise<Share | null>} A promise that resolves to the `Share` object if the document exists, otherwise `null`.
 */
export const getShare = async ({
  shareId,
}: {
  shareId: string
}): Promise<Share | null> => {
  // Reference to the specific document
  const shareDocRef = firestore.collection("shares").doc(shareId)

  // Get the document snapshot
  const docSnap = await shareDocRef.get()

  // Check if the document exists
  if (docSnap.exists) {
    return getShareFromDocSnap(docSnap)
  } else {
    return null
  }
}
