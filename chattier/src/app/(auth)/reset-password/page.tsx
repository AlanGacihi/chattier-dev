import ResetPassword from "./ResetPassword"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Your Password | Chattier",
  description:
    "Forgot your password? Reset it here and regain access to Chattier, your AI-powered WhatsApp chat analysis platform.",
  keywords: [
    "chattier reset password",
    "WhatsApp chat analysis password reset",
    "chattier AI reset password",
    "forgot password chattier",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Reset Password Chattier",
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
    "apple-mobile-web-app-title": "Chattier Reset Password",
  },
}

const Page = () => {
  return <ResetPassword />
}

export default Page
