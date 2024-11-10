"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { trpc } from "../../_trpc/client"
import Bouncy from "@/components/ldrs/Bouncy"

const AuthCallback = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const origin = searchParams.get("origin")

  const { data, error } = trpc.auth.checkUserPublicKeyGeneration.useQuery(
    undefined,
    {
      retry: true,
      retryDelay: 500,
    }
  )

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : "/dashboard")
    } else if (error) {
      router.push("/sign-in")
    }
  }, [data, error, router, origin])

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Bouncy />
        <h3 className="font-semibold text-xl">Setting up your account...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  )
}

export default AuthCallback
