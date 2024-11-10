import { getCurrentUser } from "@/auth/server"
import { redirect } from "next/navigation"
import SignIn from "./SignIn"
import { Metadata } from "next"

/**
 * Interface representing the properties passed to the `Page` component.
 */
interface PageProps {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}

export const metadata: Metadata = {
  title: "Sign In to Chattier | AI WhatsApp Analysis",
  description:
    "Sign in to Chattier to start analyzing your WhatsApp chats with powerful AI tools. Gain valuable insights into your conversations today.",
  keywords: [
    "chattier sign in",
    "WhatsApp chat analysis login",
    "chattier AI login",
    "WhatsApp chat analyzer",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Sign In",
      },
    ],
    siteName: "Chattier",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    images: "/opengraph-image.png",
  },
  other: {
    "apple-mobile-web-app-title": "Chattier Sign In",
  },
}

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @param {PageProps} searchParams - The query parameters from the URL.
 * @returns {Promise<JSX.Element>} The rendered sign-in component or a redirect.
 */
const Page = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  const origin = searchParams.origin as string | undefined
  const user = await getCurrentUser()

  if (user && user.emailVerified) {
    return redirect(origin || "/dashboard")
  }

  if (user && !user.emailVerified) {
    redirect(`/verify-email?mode=verifyEmail&to=${user.email}`)
  }

  return <SignIn origin={origin} />
}

export default Page
