import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import UpgradeButton from "@/components/UpgradeButton"
import { PLANS } from "@/lemonsqueezy/constants"
import { getCurrentUser } from "@/auth/server"
import { cn } from "@/lib/utils"
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react"
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chattier Pricing | AI-Powered WhatsApp Chat Analyzer",
  description:
    "Explore Chattier’s pricing options and discover the right plan for you. Get advanced AI WhatsApp chat analysis features tailored to your needs.",
  keywords: [
    "chattier pricing",
    "WhatsApp chat analysis pricing",
    "chattier AI pricing",
    "chat analysis subscription plans",
  ],
  openGraph: {
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Chattier Pricing",
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
    "apple-mobile-web-app-title": "Chattier Pricing",
  },
}

const Page = async () => {
  const user = await getCurrentUser()

  const pricingItems = [
    {
      plan: "Basic",
      tagline: "For personal use and small groups.",
      quota: PLANS.find((p) => p.slug === "basic")!.quota,
      features: [
        {
          text: "Analyze up to 1,000 messages",
          footnote: "Per chat analysis",
        },
        {
          text: "Up to 5 participants",
          footnote: "Maximum number of chat participants",
        },
        {
          text: "Smart AI-powered insights",
          footnote: "Our basic AI model helps you uncover key trends",
        },
        {
          text: "Email support",
          footnote: "We're here to help when you need us",
        },
        {
          text: "Dark Theme",
          negative: true,
        },
        {
          text: "Custom integrations",
          negative: true,
        },
      ],
    },
    {
      plan: "Pro",
      tagline: "For power users and small businesses.",
      quota: PLANS.find((p) => p.slug === "pro")!.quota,
      features: [
        {
          text: "Analyze up to 10,000 messages",
          footnote: "Per chat analysis",
        },
        {
          text: "50 participants",
          footnote: "Maximum number of chat participants",
        },
        {
          text: "Advanced AI-powered insights",
          footnote: "Uncover complex patterns and actionable intelligence",
        },
        {
          text: "Priority support",
          footnote: "Get help faster when you need it",
        },
        {
          text: "Dark Theme",
          footnote: "Reduce eye strain during long analysis sessions",
        },
        {
          text: "Custom integrations",
          negative: true,
        },
      ],
    },
    {
      plan: "Enterprise",
      tagline: "For large organizations.",
      quota: PLANS.find((p) => p.slug === "enterprise")!.quota,
      features: [
        {
          text: "Unlimited message analysis",
          footnote: "No restrictions on chat size or complexity",
        },
        {
          text: "Unlimited participants",
          footnote: "Seamlessly analyze company-wide communications",
        },
        {
          text: "State-of-the-art AI Model",
          footnote: "Benefit from our most advanced analytical capabilities",
        },
        {
          text: "24/7 Dedicated support",
          footnote: "Direct line to our expert support team",
        },
        {
          text: "Dark Theme",
          footnote: "Reduce eye strain during long analysis sessions",
        },
        {
          text: "Custom integrations",
          footnote: "Seamlessly connect with your existing workflow",
        },
      ],
    },
  ]

  return (
    <>
      <MaxWidthWrapper className="mb-16 mt-24 text-center">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-600 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>

        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-3">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price || 0

              return (
                <div
                  key={plan}
                  className={cn("relative rounded-2xl bg-white shadow-lg", {
                    "border-2 border-indigo-100 shadow-indigo-200":
                      plan === "Pro",
                    "border border-gray-200": plan !== "Pro",
                  })}
                >
                  {plan === "Pro" && (
                    <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-cyan-600 to-indigo-600 px-3 py-2 text-sm font-medium text-white">
                      Upgrade now
                    </div>
                  )}

                  <div className="p-5">
                    <h3 className="my-3 text-center font-display text-3xl font-bold">
                      {plan}
                    </h3>
                    <p className="text-gray-500">{tagline}</p>
                    {plan === "Enterprise" ? (
                      <p className="my-9 py-0.5 font-display text-5xl font-medium">
                        Custom
                      </p>
                    ) : (
                      <>
                        <p className="my-5 font-display text-6xl font-semibold">
                          ${price}
                        </p>
                        <p className="text-gray-500">per month</p>
                      </>
                    )}
                  </div>

                  <div className="flex h-20 items-center justify-center border-b border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-1">
                      <p>{quota.toLocaleString()} chat analyses/mo</p>

                      <Tooltip delayDuration={300}>
                        <TooltipTrigger className="cursor-default ml-1.5">
                          <HelpCircle className="h-4 w-4 text-zinc-500" />
                        </TooltipTrigger>
                        <TooltipContent className="w-80 p-2">
                          <p className="text-sm text-gray-600">
                            A chat analysis includes processing and generating
                            insights for one chat export. Unused analyses do not
                            roll over to the next month.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <ul className="my-10 space-y-5 px-8 text-sm">
                    {features.map(
                      ({
                        text,
                        footnote,
                        negative,
                      }: {
                        text: string
                        footnote?: string
                        negative?: boolean
                      }) => (
                        <li key={text} className="flex space-x-5">
                          <div className="flex-shrink-0">
                            {negative ? (
                              <Minus className="h-6 w-6 text-gray-300" />
                            ) : (
                              <Check className="h-6 w-6 text-indigo-500" />
                            )}
                          </div>
                          {footnote ? (
                            <div className="flex items-center text-left space-x-1">
                              <p
                                className={cn("text-gray-600", {
                                  "text-gray-400": negative,
                                })}
                              >
                                {text}
                              </p>
                              <Tooltip delayDuration={300}>
                                <TooltipTrigger className="cursor-default ml-1.5">
                                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                                </TooltipTrigger>
                                <TooltipContent className="w-80 p-2">
                                  {footnote}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ) : (
                            <p
                              className={cn("text-gray-600", {
                                "text-gray-400": negative,
                              })}
                            >
                              {text}
                            </p>
                          )}
                        </li>
                      )
                    )}
                  </ul>
                  <div className="border-t border-gray-200" />
                  <div className="p-5">
                    {plan === "Basic" ? (
                      <Link
                        href={user ? "/dashboard" : "/sign-up"}
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        Start for Free
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : plan === "Enterprise" ? (
                      <Link
                        href="mailto:support@chattier.ai"
                        className={buttonVariants({
                          className: "w-full",
                          variant: "secondary",
                        })}
                      >
                        Contact us
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    ) : user ? (
                      <UpgradeButton />
                    ) : (
                      <Link
                        href="/sign-in"
                        className={buttonVariants({
                          className: "w-full",
                        })}
                      >
                        {user ? "Upgrade now" : "Sign up"}
                        <ArrowRight className="h-5 w-5 ml-1.5" />
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  )
}

export default Page
