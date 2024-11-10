import { firestore } from "@/firebase/admin"
import { getCurrentUser } from "@/auth/server"
import { Chat } from "@/types/types"
import { getChatFromDoc } from "@/types/parse_data"

/**
 * Retrieves a chat document from the database.
 *
 * @param {Object} params - The parameters for the function.
 * @param {string} params.chatId - The ID of the chat to retrieve.
 * @returns {Promise<Chat | null>} - The chat object if found, otherwise `null`.
 * @throws {Error} - Throws an error if the user is unauthorized.
 */
export const getChat = async ({
  chatId,
}: {
  chatId: string
}): Promise<Chat | null> => {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("UNAUTHORIZED")
  }
  const userId = user.uid

  const docRef = firestore
    .collection("users")
    .doc(userId)
    .collection("chats")
    .doc(chatId)

  const docSnap = await docRef.get()

  if (docSnap.exists) {
    return getChatFromDoc(docSnap)
  } else {
    return null
  }
}
