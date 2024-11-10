import { notFound, redirect } from "next/navigation"
import { getChat } from "./actions"
import { getCurrentUser } from "@/auth/server"
import ChatAnalysesDashboard from "./ChatAnalysesDashboard"

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @param {Object} params - The parameters from the URL.
 * @param {Object} params.chatId - The chat ID from the URL.
 * @returns {Promise<JSX.Element>} The rendered chat analyses dashboard component or a redirect.
 */
const Page = async ({
  params,
}: {
  params: { chatId: string }
}): Promise<JSX.Element> => {
  const { chatId } = params

  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }

  if (!user.publicKey) {
    redirect(`/auth-callback?origin=upload`)
  }

  const chat = await getChat({ chatId })

  if (!chat) {
    return notFound()
  }

  return (
    <ChatAnalysesDashboard
      userId={user.uid}
      userPublicKey={user.publicKey}
      chat={chat}
    />
  )
}

export default Page
