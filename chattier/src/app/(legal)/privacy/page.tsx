import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | Chattier",
  description:
    "Learn how Chattier handles your data, including the collection, use, and protection of personal information while using our AI-powered WhatsApp chat analysis platform.",
  keywords: [
    "chattier privacy policy",
    "WhatsApp chat analysis privacy",
    "data privacy policy",
    "chattier AI privacy",
    "privacy policy",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Privacy Policy",
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
    "apple-mobile-web-app-title": "Chattier Privacy",
  },
}

const Page = () => {
  return (
    <div className="w-full bg-background text-gray-800 font-sans">
      <MaxWidthWrapper className="py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-green-600">
          Privacy Policy
        </h1>
        <p className="text-sm mb-6">
          Last updated and effective date: 24 September 2024
        </p>

        <p className="mb-4">
          Welcome to Chattier.ai (the &quot;Service&quot;), provided by Chattier
          (&quot;Chattier&quot;, &quot;we&quot;, &quot;us&quot;, and/or
          &quot;our&quot;). Chattier offers AI-Powered WhatsApp Chats Analysis.
          We value your privacy and are committed to protecting your personal
          data. This Privacy Policy outlines how we collect, handle, and
          disclose personal data in our Service.
        </p>

        <p className="mb-6">
          If you have any questions, comments, or concerns regarding this
          Privacy Policy, our data practices, or would like to exercise your
          rights, please don&apos;t hesitate to contact us.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          To Whom Does This Policy Apply
        </h2>
        <p className="mb-6">
          This Privacy Policy applies to all users of Chattier.ai. Each user is
          responsible for ensuring their use of the Service complies with all
          applicable laws and regulations, especially concerning the privacy of
          WhatsApp chat participants.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          Changes To This Privacy Policy
        </h2>
        <p className="mb-6">
          This Privacy Policy may be updated from time to time as our Service
          and business evolve. Your continued use of Chattier.ai after any
          changes to this Privacy Policy indicates your acceptance of the
          revised Privacy Policy.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          What Information Do We Collect
        </h2>
        <p className="mb-6">
          We collect information you provide directly when using our Service,
          including but not limited to account information and uploaded WhatsApp
          chat data. We also collect usage data to improve our Service. We do
          not use third-party cookies on our Service.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          What We Use Your Information For
        </h2>
        <p className="mb-6">
          We use your information to provide and improve our AI-Powered WhatsApp
          chats Analyzer, to understand how you use our Service, and to
          communicate with you about your account and our Service. We do not
          sell any information to third parties.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          Data Security and Retention
        </h2>
        <p className="mb-6">
          We implement appropriate technical and organizational measures to
          protect your data. WhatsApp chat data is processed for analysis and is
          not retained longer than necessary for the purpose of providing our
          Service.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          Your Rights
        </h2>
        <p className="mb-6">
          Depending on your location, you may have certain rights regarding your
          personal data, including the right to access, correct, or delete your
          data. Please contact us to exercise these rights.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          How To Contact Us
        </h2>
        <p className="mb-6">
          For privacy-related questions or to exercise your rights, please
          contact us at{" "}
          <a
            href="mailto:support@chattier.ai"
            className="text-green-600 hover:underline"
          >
            support@chattier.ai
          </a>
          .
        </p>
      </MaxWidthWrapper>
    </div>
  )
}

export default Page
