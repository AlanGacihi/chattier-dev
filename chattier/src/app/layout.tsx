import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/Footer"
import { Toaster } from "@/components/ui/sonner"
import { GeistSans } from "geist/font/sans"

import Navbar from "@/components/Navbar"
import QueryProvider from "@/components/QueryProvider"
import AuthProvider from "@/components/firebase/AuthProvider"
import PHProvider from "@/components/posthog/PostHogProvider"
import dynamic from "next/dynamic"
import { getCurrentUser } from "@/auth/server"

/**
 * Metadata for the root layout of the application.
 * @constant
 * @type {Metadata}
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://chattier.ai"),
  title: "Chattier | AI-Powered WhatsApp Chat Analyzer",
  description:
    "Chattier offers advanced AI analysis of your WhatsApp chats. Gain and share valuable insights into conversation dynamics, sentiment, and more. Upload your chat and discover hidden patterns in your communications.",
  keywords: [
    "chattier",
    "chattier AI",
    "WhatsApp chat analysis",
    "conversation insights",
    "text analysis",
    "communication patterns",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier",
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
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-title": "Chattier",
    "format-detection": "telephone=no",
    "msapplication-TileImage": "/opengraph-image.png",
  },
}

const PostHogPageView = dynamic(
  () => import("@/components/posthog/PostHogPageView"),
  {
    ssr: false,
  }
)

/**
 * The root layout component for the application, which wraps the entire application content.
 * @param {Readonly<{ children: React.ReactNode }>} props - The component props.
 * @param {React.ReactNode} props.children - The child components to be rendered within the layout.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered root layout component.
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>): Promise<JSX.Element> {
  const user = await getCurrentUser()

  return (
    <html lang="en">
      <QueryProvider>
        <AuthProvider isServerAuthenticated={!!user}>
          <PHProvider>
            <body className={GeistSans.className}>
              <PostHogPageView />
              <Navbar user={user} />
              <main className="flex grainy antialiased flex-col min-h-[calc(100vh-3.5rem-1px)]">
                <div className="flex-1 flex flex-col h-full">{children}</div>
                <Footer />
              </main>
              <Toaster richColors />
            </body>
          </PHProvider>
        </AuthProvider>
      </QueryProvider>
    </html>
  )
}
