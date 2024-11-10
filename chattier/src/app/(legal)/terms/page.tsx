import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | Chattier",
  description:
    "Read the terms and conditions for using Chattier, an AI-powered platform for WhatsApp chat analysis. Understand your rights and responsibilities while using our services.",
  keywords: [
    "chattier terms of service",
    "WhatsApp chat analysis terms",
    "chattier AI terms",
    "terms and conditions",
    "chattier service agreement",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Terms of Service",
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
    "apple-mobile-web-app-title": "Chattier Terms",
  },
}

const Page = () => {
  return (
    <div className="w-full bg-background text-gray-800 font-sans">
      <MaxWidthWrapper className="py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-green-600">
          Terms of Service
        </h1>
        <p className="text-sm mb-6">
          Last updated and effective date: 24 September 2024
        </p>

        <p className="mb-4">
          Subject to these Terms of Service (this &quot;Agreement&quot;),
          Chattier.ai (&quot;Chattier&quot;, &quot;we&quot;, &quot;us&quot;
          and/or &quot;our&quot;) provides access to Chattier&apos;s AI-Powered
          WhatsApp Chat Analyzer (collectively, the &quot;Services&quot;). By
          using or accessing the Services, you acknowledge that you have read,
          understand, and agree to be bound by this Agreement.
        </p>

        <p className="mb-6">
          If you are entering into this Agreement on behalf of a company,
          business or other legal entity, you represent that you have the
          authority to bind such entity to this Agreement, in which case the
          term &quot;you&quot; shall refer to such entity. If you do not have
          such authority, or if you do not agree with this Agreement, you must
          not accept this Agreement and may not use the Services.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          1. Acceptance of Terms
        </h2>
        <p className="mb-6">
          By signing up and using the services provided by Chattier (referred to
          as the &quot;Service&quot;), you are agreeing to be bound by the
          following terms and conditions (&quot;Terms of Service&quot;). The
          Service is owned and operated by Chattier (&quot;Us&quot;,
          &quot;We&quot;, or &quot;Our&quot;).
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          2. Description of Service
        </h2>
        <p className="mb-6">
          Chattier provides an AI-Powered WhatsApp Chat Analyzer service
          (&quot;the Product&quot;). The Product is accessible at chattier.ai
          and other domains and subdomains controlled by Us (collectively,
          &quot;the Website&quot;).
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          3. Fair Use
        </h2>
        <p className="mb-6">
          You are responsible for your use of the Service and for any content
          that you upload or analyze through the Service. You may not use the
          Service for any purpose that is illegal or infringes upon the rights
          of others. We reserve the right to suspend or terminate your access to
          the Service if we determine, in our sole discretion, that you have
          violated these Terms of Service, including but not limited to,
          misusing our AI analysis for inappropriate or illegal content.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          4. Intellectual Property Rights
        </h2>
        <p className="mb-6">
          You acknowledge and agree that the Service and its entire contents,
          features, and functionality, including but not limited to all
          information, software, code, text, displays, graphics, photographs,
          video, audio, design, presentation, selection, and arrangement, are
          owned by Us, our licensors, or other providers of such material and
          are protected by the Republic of Kenya and international copyright,
          trademark, patent, trade secret, and other intellectual property or
          proprietary rights laws.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          5. Changes to these Terms
        </h2>
        <p className="mb-6">
          We reserve the right to revise and update these Terms of Service from
          time to time in our sole discretion. All changes are effective
          immediately when we post them, and apply to all access to and use of
          the Website thereafter. Your continued use of the Website following
          the posting of revised Terms of Service means that you accept and
          agree to the changes.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          6. Contact Information
        </h2>
        <p className="mb-6">
          Questions or comments about the Website or these Terms of Service may
          be directed to us at{" "}
          <a
            href="mailto:support@chattier.ai"
            className="text-green-600 hover:underline"
          >
            support@chattier.ai
          </a>
          .
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          7. Disclaimer of Warranties
        </h2>
        <p className="mb-6">
          THE SERVICE AND ITS CONTENT ARE PROVIDED ON AN &quot;AS IS&quot; AND
          &quot;AS AVAILABLE&quot; BASIS WITHOUT ANY WARRANTIES OF ANY KIND. WE
          DISCLAIM ALL WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE WARRANTY
          OF TITLE, MERCHANTABILITY, NON-INFRINGEMENT OF THIRD PARTIES&apos;
          RIGHTS, AND FITNESS FOR PARTICULAR PURPOSE.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          8. Limitation of Liability
        </h2>
        <p className="mb-6">
          IN NO EVENT WILL WE, OUR AFFILIATES OR THEIR LICENSORS, SERVICE
          PROVIDERS, EMPLOYEES, AGENTS, OFFICERS OR DIRECTORS BE LIABLE FOR
          DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN
          CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, THE
          SERVICE, ANY WEBSITES LINKED TO IT, ANY CONTENT ON THE WEBSITE OR SUCH
          OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES.
        </p>

        <h2 className="text-2xl font-semibold mb-3 text-green-600">
          9. Governing Law and Jurisdiction
        </h2>
        <p className="mb-6">
          These Terms of Service and any dispute or claim arising out of or
          related to them, their subject matter or their formation (in each
          case, including non-contractual disputes or claims) shall be governed
          by and construed in accordance with the internal laws of the Republic
          of Kenya without giving effect to any choice or conflict of law
          provision or rule. Any legal suit, action, or proceeding arising out
          of, or related to, these Terms of Service or the Website shall be
          instituted exclusively in the courts of the Republic of Kenya.
        </p>

        <p className="mt-8">
          By using Chattier, you acknowledge that you have read these Terms of
          Service, understood them, and agree to be bound by them. If you do not
          agree to these Terms of Service, you are not authorized to use the
          Service. We reserve the right to change these Terms of Service at any
          time, so please review them frequently.
        </p>
      </MaxWidthWrapper>
    </div>
  )
}

export default Page
