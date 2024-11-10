"use client"

import { auth } from "@/firebase/client"
import { onAuthStateChanged } from "firebase/auth"
import { ReactNode, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { trpc } from "@/app/_trpc/client"

interface AuthProviderProps {
  children: ReactNode
  isServerAuthenticated: boolean
}

const AuthProvider = ({
  children,
  isServerAuthenticated,
}: AuthProviderProps): JSX.Element => {
  const router = useRouter()
  const broadcastChannel = useRef<BroadcastChannel | null>(null)

  const { mutate: signOutOnServer, isSuccess } = trpc.auth.signOut.useMutation({
    onSuccess: () => {
      router.refresh()
      broadcastChannel.current?.postMessage("refresh")
    },
  })

  useEffect(() => {
    broadcastChannel.current = new BroadcastChannel("auth_channel")

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh()
      }
    }

    const handleBroadcastMessage = (event: MessageEvent) => {
      if (event.data === "refresh") {
        router.refresh()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    broadcastChannel.current.addEventListener("message", handleBroadcastMessage)

    const initializeAuth = async () => {
      if (!isServerAuthenticated) {
        await auth.signOut()
        router.refresh()
        broadcastChannel.current?.postMessage("refresh")
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user || !auth.currentUser) {
          signOutOnServer()
        } else {
          router.refresh()
          broadcastChannel.current?.postMessage("refresh")
        }
      })

      return () => unsubscribe()
    }

    initializeAuth()

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      broadcastChannel.current?.removeEventListener(
        "message",
        handleBroadcastMessage
      )
      broadcastChannel.current?.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}

export default AuthProvider
