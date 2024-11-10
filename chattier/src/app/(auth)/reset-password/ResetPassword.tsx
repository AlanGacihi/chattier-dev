"use client"

import { sendPasswordResetLink } from "@/auth/client"
import Pie from "@/components/icons/Pie"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  ResetPasswordCredentialsValidator,
  TResetPasswordCredentialsValidator,
} from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheck, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

/**
 * A React component that handles the reset password functionality.
 *
 * @returns {JSX.Element} The rendered page component.
 */
const ResetPassword = (): JSX.Element => {
  const [isSending, setIsSending] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TResetPasswordCredentialsValidator>({
    resolver: zodResolver(ResetPasswordCredentialsValidator),
  })

  /**
   * Handles the form submission for sending a password reset link.
   *
   * @param {TResetPasswordCredentialsValidator} email - The email address to send the reset link to.
   */
  const onSubmit = ({ email }: TResetPasswordCredentialsValidator) => {
    setIsSending(true)

    try {
      sendPasswordResetLink({ email })

      setIsSending(false)
      setIsSuccess(true)

      toast.success("A password reset link has been sent to the email.")
    } catch (e) {
      setIsSending(false)

      toast.error(
        "Only emails with an existing account can receive a password reset link."
      )
    }
  }

  return (
    <>
      <div className="container relative flex-1 flex py-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Pie height={60} width={60} />
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset Password
            </h1>
          </div>

          <div className="grid gap-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="you@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <Button disabled={isSending || isSuccess} className="mt-4">
                  {isSuccess ? (
                    <div className="flex gap-4 items-center">
                      <CircleCheck className="size-4 text-white" />
                      <p className="text-white">Sent</p>
                    </div>
                  ) : isSending ? (
                    <Loader2 className="animate-spin text-white" />
                  ) : (
                    <p className="text-white">Get Link</p>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
