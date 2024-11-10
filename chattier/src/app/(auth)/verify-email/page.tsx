import { notFound, redirect } from "next/navigation"
import VerifyEmail from "./VerifyEmail"
import { getCurrentUser } from "@/auth/server"

interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @param {PageProps} searchParams - The query parameters from the URL.
 * @returns {Promise<JSX.Element>} The rendered verify email component or a redirect.
 */
const Page = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  const user = await getCurrentUser()

  const mode = searchParams.mode as string | undefined
  const toEmail = searchParams.to as string | undefined

  if (user && user.emailVerified) {
    redirect("/dashboard")
  }

  if (!mode || mode !== "verifyEmail") {
    notFound()
  }

  return <VerifyEmail toEmail={toEmail} />
}

export default Page
