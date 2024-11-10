"use client"

import { trpc } from "@/app/_trpc/client"
import { handleSocialSignIn, signUpWithEmailOnClient } from "@/auth/client"
import Google from "@/components/icons/Google"
import Pie from "@/components/icons/Pie"
import LoadingCanvas from "@/components/LoadingCanvas"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  SignUpCredentialsValidator,
  TSignUpCredentialsValidator,
} from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { GoogleAuthProvider } from "firebase/auth"
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

const SignUp = () => {
  const router = useRouter()
  const [isSigninguP, setIsSigningUp] = useState<boolean>(false)
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignUpCredentialsValidator>({
    resolver: zodResolver(SignUpCredentialsValidator),
  })

  const { mutate: signUpWithEmailOnServer } =
    trpc.auth.signUpWithEmail.useMutation({
      onSuccess: (_, { email }) => {
        toast.success(`Verification Email sent to ${email}.`)

        startTransition(() => {
          router.push(`/verify-email?mode=verifyEmail&to=${email}`)
          router.refresh()
        })

        setIsSigningUp(false)
      },
      onMutate: () => {
        setIsSigningUp(true)
      },
      onError: (e) => {
        setIsSigningUp(false)
        toast.error(e.message)
      },
    })

  const { mutate: signInWithProviderOnServer } =
    trpc.auth.signInWithProvider.useMutation({
      onSuccess: () => {
        toast.success("Signed in successfully.")

        startTransition(() => {
          router.push("/dashboard")
          router.refresh()
        })

        setIsSigningIn(false)
      },
      onError: () => {
        setIsSigningIn(false)
        toast.error("Something went wrong. Try again.")
      },
    })

  const onSubmit = async ({
    name,
    email,
    password,
  }: TSignUpCredentialsValidator) => {
    setIsSigningUp(true)

    try {
      const { userId, idToken } = await signUpWithEmailOnClient({
        email,
        password,
      })
      signUpWithEmailOnServer({ userId, idToken, name, email })
    } catch (error) {
      setIsSigningUp(false)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Something went wrong. Try again.")
      }
    }
  }

  /**
   * Initiates the Google sign-in process.
   */
  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider()

    setIsSigningIn(true)

    try {
      const { userId, name, idToken, email } = await handleSocialSignIn(
        provider
      )
      signInWithProviderOnServer({ userId, name, idToken, email })
    } catch (error) {
      setIsSigningIn(false)

      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error("Something went wrong. Try again.")
      }
    }
  }

  return (
    <>
      {isPending ? (
        <LoadingCanvas />
      ) : (
        <div className="container relative flex-1 flex py-20 flex-col items-center justify-center lg:px-0">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col items-center space-y-2 text-center">
              <Pie height={60} width={60} />
              <h1 className="text-2xl font-semibold tracking-tight">
                Create an account
              </h1>

              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "gap-1.5",
                })}
                href="/sign-in"
              >
                Already have an account? Sign-in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-2">
                  <div className="grid gap-1 py-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      {...register("name")}
                      className={cn({
                        "focus-visible:ring-red-500": errors.name,
                      })}
                      placeholder="Name"
                    />
                    {errors?.name && (
                      <p className="text-sm text-red-500">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

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

                  <div className="grid gap-1 py-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      {...register("password")}
                      type="password"
                      className={cn({
                        "focus-visible:ring-red-500": errors.password,
                      })}
                      placeholder="Password"
                    />
                    {errors?.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-1 py-2">
                    <Label htmlFor="password"> Confirm Password</Label>
                    <Input
                      {...register("confirmPassword")}
                      type="password"
                      className={cn({
                        "focus-visible:ring-red-500": errors.confirmPassword,
                      })}
                      placeholder="Confirm Password"
                    />
                    {errors?.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    disabled={isSigninguP || isSigningIn}
                    className="mt-4"
                  >
                    {isSigninguP ? (
                      <Loader2 className="animate-spin text-white" />
                    ) : (
                      <p className="text-white">Sign Up</p>
                    )}
                  </Button>
                </div>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <Button
                  onClick={handleGoogleSignIn}
                  variant="outline"
                  disabled={isSigningIn || isSigninguP}
                >
                  <Google width={25} height={25} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SignUp
