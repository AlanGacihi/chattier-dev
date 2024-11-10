import { getCurrentUser } from "@/auth/server"
import { notFound, redirect } from "next/navigation"
import ChatAnalysisDashboard from "./ChatAnalysisDashboard"

/**
 * Props for the Page component.
 * @interface PageProps
 * @property {Object} params - Route parameters for the page.
 * @property {string} params.chatId - The ID of the chat related to the page.
 * @property {string} params.analysisId - The ID of the analysis related to the page.
 * @property {Object} searchParams - Query parameters from the URL.
 * @property {string | string[] | undefined} [searchParams[key: string]] - The value of the query parameter, which can be a string, an array of strings, or undefined.
 */
interface PageProps {
  params: {
    chatId: string
    analysisId: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @param {PageProps} searchParams - The query parameters from the URL.
 * @returns {Promise<JSX.Element>} The rendered chat analyses dashboard component or a redirect.
 */
const Page = async ({
  params,
  searchParams,
}: PageProps): Promise<JSX.Element> => {
  const { chatId, analysisId } = params

  if (!chatId || !analysisId) {
    notFound()
  }

  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }

  if (!user.publicKey) {
    redirect(`/auth-callback?origin=upload`)
  }

  return (
    <ChatAnalysisDashboard
      chatId={chatId}
      analysisId={analysisId}
      isNew={searchParams.new === "true"}
    />
  )
}

export default Page
