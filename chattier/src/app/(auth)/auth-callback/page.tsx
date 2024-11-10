"use client"

import LoadingCanvas from "@/components/LoadingCanvas"
import { Suspense } from "react"
import AuthCallback from "./AuthCallback"

const Page = () => {
  return (
    <Suspense fallback={<LoadingCanvas />}>
      <AuthCallback />
    </Suspense>
  )
}

export default Page
