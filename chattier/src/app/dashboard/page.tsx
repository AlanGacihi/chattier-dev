import { redirect } from "next/navigation"
import Dashboard from "./Dashboard"
import { getCurrentUser } from "@/auth/server"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chattier Dashboard | Analyze Your WhatsApp Conversations",
  description:
    "Welcome to the Chattier Dashboard, where you can upload and analyze your WhatsApp conversations with AI-powered tools. Gain insights into conversation dynamics and more.",
  keywords: [
    "chattier dashboard",
    "WhatsApp chat analysis",
    "AI insights",
    "conversation analysis",
    "chattier AI dashboard",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Dashboard",
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
    "apple-mobile-web-app-title": "Chattier Dashboard",
  },
}

/**
 * A server-side rendered page component that handles user authentication and redirection.
 *
 * @returns {Promise<JSX.Element>} The rendered dashboard component or a redirect.
 */
const Page = async (): Promise<JSX.Element> => {
  const user = await getCurrentUser()
  if (!user) {
    redirect("/sign-in")
  }

  if (!user.publicKey) {
    redirect(`/auth-callback?origin=upload`)
  }

  return <Dashboard userId={user.uid} userPublicKey={user.publicKey!} />
}

export default Page
