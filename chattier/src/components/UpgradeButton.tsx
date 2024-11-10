"use client"

import { ArrowRight } from "lucide-react"
import { Button } from "./ui/button"
import { trpc } from "@/app/_trpc/client"
import { toast } from "sonner"

const UpgradeButton = () => {
  const { mutate: createStripeSession } =
    trpc.payment.createLemonSqueezyCheckout.useMutation({
      onSuccess: ({ url }) => {
        window.location.href = url ?? "/dashboard/billing"
      },
      onError: () => {
        toast.error("Something went wrong. Try again in a moment.")
      },
    })

  return (
    <Button onClick={() => createStripeSession()} className="w-full">
      Upgrade now <ArrowRight className="h-5 w-5 ml-1.5" />
    </Button>
  )
}

export default UpgradeButton
