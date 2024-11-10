"use client"

import LineSpinner from "@/components/ldrs/LineSpinner"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase/client"
import { sendEmailVerification } from "firebase/auth"
import { CheckCircle, MailCheck } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

const VerifyEmail = ({ toEmail }: { toEmail?: string }) => {
  const [isSending, setisSending] = useState<boolean>(false)
  const [hasSent, setHasSent] = useState<boolean>(false)

  return (
    <div className="flex-1 flex flex-col items-center justify-center lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex h-full flex-col items-center justify-center gap-y-3">
          <div className="flex flex-col items-center justify-center mb-4 relative size-28">
            <MailCheck className="size-24 text-green-600" />
          </div>
          <h3 className="font-semibold text-2xl">Check your email</h3>
          <p className="text-muted-foreground text-center mb-4">
            We&apos;ve sent a {hasSent ? " new " : " "} verification link to{" "}
            {toEmail ? (
              <span className="font-semibold">{toEmail}</span>
            ) : (
              "your email"
            )}
            .
          </p>

          <Button
            disabled={isSending || hasSent}
            onClick={async () => {
              try {
                setisSending(true)
                await sendEmailVerification(auth.currentUser!, {
                  url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
                })
                setisSending(false)
                setHasSent(true)
                toast.success(
                  "A new verification link has been sent to your email."
                )
              } catch (error) {
                setisSending(false)
                toast.error("Something went wrong. Try again.")
              }
            }}
          >
            {isSending ? (
              <div className="flex items-center gap-2 text-white">
                <LineSpinner size={20} color="white" />
                Sending
              </div>
            ) : hasSent ? (
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="text-white" />
                Sent
              </div>
            ) : (
              "Get a new link"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
