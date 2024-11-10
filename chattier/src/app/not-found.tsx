import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 max-w-2xl">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-[150] h-[150] mx-auto"
        >
          <source src="/not-found-animation.webm" type="video/webm" />
          Your browser does not support the video tag.
        </video>
        <div className="flex flex-col h-full items-center sm:items-start justify-center px-4 sm:px-0">
          <p className="text-gray-600 mb-8 text-center sm:text-left text-sm">
            Oops! It seems you&apos;ve ventured into uncharted digital
            territory. The page you&apos;re looking for doesn&apos;t exist or
            may have been moved.
          </p>
          <Button size={"sm"} asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
