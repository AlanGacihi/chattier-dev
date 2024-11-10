"use client"

import { trpc } from "@/app/_trpc/client"
import Bouncy from "@/components/ldrs/Bouncy"
import { buttonVariants } from "@/components/ui/button"
import { auth } from "@/firebase/client"
import { CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"

const Page = (): JSX.Element => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const broadcastChannel = useRef<BroadcastChannel | null>(null)

  const { mutate: signOutOnServer, isSuccess } = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      router.refresh()
      broadcastChannel.current?.postMessage("logout")
    },
    onError: () => setIsError(true),
    onSettled: () => setIsLoading(false),
  })

  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel("auth_channel")

    const handleLogout = async () => {
      setIsLoading(true)
      try {
        await auth.signOut()
        signOutOnServer()
      } catch (error) {
        setIsLoading(false)
        setIsError(true)
      }
    }

    handleLogout()

    return () => {
      broadcastChannel.current?.close()
    }
  }, [signOutOnServer])

  useEffect(() => {
    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data === "logout") {
        router.refresh()
      }
    }

    broadcastChannel.current?.addEventListener(
      "message",
      handleBroadcastMessage
    )

    return () => {
      broadcastChannel.current?.removeEventListener(
        "message",
        handleBroadcastMessage
      )
    }
  }, [router])

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      {isLoading && (
        <div className="flex flex-col items-center gap-6">
          <Bouncy size={45} />
          <div className="flex flex-col items-center gap-3">
            <h3 className="font-semibold text-2xl">Signing out...</h3>
          </div>
        </div>
      )}
      {isError && (
        <div className="flex flex-col items-center gap-2">
          <XCircle className="h-8 w-8 text-red-600" />
          <h3 className="font-semibold text-xl">There was a problem</h3>
          <p className="text-muted-foreground text-sm">
            Unable to log out. Please try again.
          </p>
        </div>
      )}
      {isSuccess && (
        <div className="flex flex-col items-center gap-6">
          <CheckCircle className="size-10 text-green-600" />
          <h3 className="font-semibold text-2xl">Successfully logged out</h3>
          <p className="text-muted-foreground text-center mt-1">
            You have been logged out. Thank you for visiting.
          </p>
          <Link
            className={buttonVariants({ className: "mt-4 px-8" })}
            href="/sign-in"
          >
            Sign in
          </Link>
        </div>
      )}
      {!isLoading && !isError && !isSuccess && (
        <div className="text-muted-foreground">Something went wrong...</div>
      )}
    </div>
  )
}

export default Page
