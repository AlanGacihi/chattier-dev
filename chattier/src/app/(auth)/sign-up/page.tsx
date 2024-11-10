import { getCurrentUser } from "@/auth/server"
import { redirect } from "next/navigation"
import SignUp from "./SignUp"
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
  title: "Sign Up for Chattier | AI WhatsApp Chat Analysis",
  description:
    "Create a Chattier account to start analyzing your WhatsApp conversations with advanced AI. Gain insights, discover patterns, and explore your chat data.",
  keywords: [
    "chattier sign up",
    "WhatsApp chat analysis registration",
    "chattier AI sign up",
    "chat analyzer sign up",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Sign Up",
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
    "apple-mobile-web-app-title": "Chattier Sign Up",
  },
}

const Page = async ({ searchParams }: PageProps): Promise<JSX.Element> => {
  const origin = searchParams.origin as string | undefined
  const user = await getCurrentUser()

  if (user && user.emailVerified) {
    return redirect(origin || "/dashboard")
  }

  if (user && !user.emailVerified) {
    redirect(`/verify-email?mode=verifyEmail&to=${user.email}`)
  }

  return <SignUp />
}

export default Page
