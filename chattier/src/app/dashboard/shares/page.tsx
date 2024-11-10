import { getCurrentUser } from "@/auth/server"
import { redirect } from "next/navigation"
import SharesDashboard from "./SharesDashboard"

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @returns {Promise<JSX.Element>} The rendered shares dashboard component or a redirect.
 */
const Page = async (): Promise<JSX.Element> => {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/sign-in")
  }

  return <SharesDashboard />
}

export default Page
