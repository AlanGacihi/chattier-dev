import ChatAnalyticsPreviews from "@/components/ChatAnalyticsPreviews"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { buttonVariants } from "@/components/ui/button"
import { Cover } from "@/components/ui/cover"
import { ArrowRight, PieChart, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

/**
 * The Home component displays the landing page.
 * @function
 * @returns {JSX.Element} The rendered component - Landing Page.
 */
export default function Home(): JSX.Element {
  return (
    <>
      <BackgroundBeams>
        <div className="w-full mb-12 bg-transparent dark:bg-dot-white/[0.2] bg-grid-black/[0.1] relative flex items-center justify-center">
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-gradient-to-b from-white to-neutral-100 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
          <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-gradient-to-b from-white to-neutral-100 [mask-image:linear-gradient(to_bottom,transparent_90%,black)]"></div>
          <MaxWidthWrapper className="relative mt-20 mb-12 sm:mt-28 flex flex-col items-center justify-center text-center">
            <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl leading-tight">
              Analyze your{" "}
              <span className="text-green-600">WhatsApp chats</span> at{" "}
              <Cover>warp speed</Cover>
            </h1>

            <p className="mt-5 max-w-prose text-zinc-800 sm:text-lg">
              Chattier allows you to gain insights from your WhatsApp
              conversations. Simply upload your chat export and get AI-powered
              analysis right away.
            </p>

            <Link
              className={buttonVariants({
                size: "lg",
                className: "mt-5",
              })}
              href="/sign-up"
              target="_blank"
            >
              Get started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </MaxWidthWrapper>
        </div>
      </BackgroundBeams>

      {/* value proposition section */}
      <div className="h-full w-full px-2.5 md:px-20 bg-neutral-100">
        <div className="relative w-full pb-16 sm:pb-24">
          <div className="mx-auto max-w-6xl pb-12">
            <div className="flow-root">
              <div className="-mt-2 rounded-xl bg-neutral-900/5 p-2 md:p-4 ring-1 ring-inset ring-neutral-900/10 lg:-mt-4 lg:rounded-2xl">
                <Image
                  src="/chat-analytics-preview.png"
                  alt="product preview"
                  width={1283}
                  height={721}
                  quality={100}
                  className="rounded-md bg-white ring-1 ring-neutral-900/10"
                />
              </div>
            </div>
          </div>

          <MaxWidthWrapper className="flex flex-col items-center gap-10 sm:gap-12 mb-8">
            <h2 className="mt-8 text-center text-balance font-bold text-5xl md:text-6xl text-gray-900">
              Chat insights in action
            </h2>

            <div className="mx-auto grid max-w-2xl grid-cols-1 px-4 lg:mx-0 lg:max-w-none lg:grid-cols-2 gap-y-16 gap-x-12">
              <div className="flex flex-auto flex-col gap-4">
                <div className="flex gap-0.5 mb-2">
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div className="text-lg leading-8">
                  <p>
                    &quot;The interface is so user-friendly, I was analyzing my
                    chats within minutes of signing up. Even though the tool is
                    new,{" "}
                    <span className="p-0.5 bg-slate-800 text-white">
                      the insights are surprisingly deep
                    </span>
                    . I&apos;ve tried other tools before, but they were
                    overwhelming. This one strikes the perfect balance between
                    simplicity and depth. Can&apos;t wait to see how it
                    evolves!&quot;
                  </p>
                </div>
                <div className="flex gap-5 mt-2">
                  <Image
                    className="rounded-full h-12 w-12 object-cover"
                    src="/users/user-2.jpg"
                    width={3456}
                    height={5184}
                    alt="user"
                  />
                  <div className="flex flex-col space-y-0.5">
                    <p className="font-semibold">Joe</p>
                    <div className="flex gap-1.5 items-center text-zinc-600">
                      <PieChart className="h-4 w-4 stroke-[3px] text-green-600" />
                      <p className="text-sm">50+ Chats Analyzed</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* second user review */}
              <div className="flex flex-auto flex-col gap-4">
                <div className="flex gap-0.5 mb-2">
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                  <Star className="h-5 w-5 text-green-600 fill-green-600" />
                </div>
                <div className="text-lg leading-8">
                  <p>
                    &quot;I&apos;ve been looking for a tool to analyze my
                    one-on-one WhatsApp conversations, and this web app nails
                    it. It&apos;s only been out for a month, but it&apos;s
                    already become an essential part of my weekly routine.{" "}
                    <span className="p-0.5 bg-slate-800 text-white">
                      The insights into my texting habits are eye-opening
                    </span>
                    . I&apos;m excited to see group chat analysis in the
                    future!&quot;
                  </p>
                </div>
                <div className="flex gap-5 mt-2">
                  <Image
                    className="rounded-full h-12 w-12 object-cover"
                    src="/users/user-1.jpg"
                    width={3542}
                    height={4600}
                    alt="user"
                  />
                  <div className="flex flex-col space-y-0.5">
                    <p className="font-semibold">Linet</p>
                    <div className="flex gap-1.5 items-center text-zinc-600">
                      <PieChart className="h-4 w-4 stroke-[3px] text-green-600" />
                      <p className="text-sm">100+ Chats Analyzed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </MaxWidthWrapper>

          <ChatAnalyticsPreviews />
        </div>
      </div>

      {/* Feature section */}
      <div className="mx-auto mb-16 mt-12 max-w-5xl sm:mt-16">
        <div className="mb-6 sm:mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-5xl text-gray-900 md:text-6xl">
              Analyze your chats in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Getting insights from your WhatsApp conversations has never been
              easier than with Chattier.
            </p>
          </div>
        </div>

        {/* steps */}
        <ol className="my-8 space-y-4 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-green-600">Step 1</span>
              <span className="text-xl font-semibold">
                Export your WhatsApp chat
              </span>
              <span className="mt-2 text-zinc-700">
                Export your WhatsApp chat (without media) from your device.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-green-600">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your chat file
              </span>
              <span className="mt-2 text-zinc-700">
                Upload the zip file or extracted _chat.txt file to our secure
                platform.
              </span>
            </div>
          </li>
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-green-600">Step 3</span>
              <span className="text-xl font-semibold">
                View your chat insights
              </span>
              <span className="mt-2 text-zinc-700">
                Get AI-powered analysis on various aspects of your conversation.
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-2.5 md:px-0">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="rounded-xl bg-gray-900/5 p-2 md:p-4 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl">
              <Image
                src="/file-upload-preview.png"
                alt="uploading preview"
                width={1185}
                height={702}
                quality={100}
                className="rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>

        {/* Privacy section */}
        <div className="max-w-4xl md:flex-1 px-0.5 md:px-0">
          <div className="mt-16 md:sm:24 border-t border-gray-200 pt-10">
            <h3 className="text-2xl font-bold text-gray-900">
              Your Privacy Matters
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              At Chattier, we take your privacy seriously. We employ bank-grade
              envelope encryption to protect your chats during transfer,
              ensuring maximum security. Our zero-retention policy means we
              don&apos;t store your conversations after analysis, and all
              processing occurs in a secure environment. Our AI-powered insights
              are generated without human intervention, ensuring your
              conversations remain private.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
