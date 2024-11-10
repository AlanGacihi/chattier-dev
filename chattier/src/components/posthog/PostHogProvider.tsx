"use client"

import { ReactNode, useEffect } from "react"
import posthog from "posthog-js"
import { PostHogProvider } from "posthog-js/react"
import { auth } from "@/firebase/client"

const PHProvider = ({ children }: { children: ReactNode }) => {
  const user = auth.currentUser

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: "/ingest",
      ui_host: "https://eu.posthog.com",
      capture_pageleave: false,
      autocapture: {
        dom_event_allowlist: [],
        element_allowlist: [],
        css_selector_allowlist: [],
      },
    })

    if (user) {
      posthog.identify(user.uid, {
        email: user.email,
        name: user.displayName,
      })
    } else {
      posthog.reset()
    }
  }, [user])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}

export default PHProvider
