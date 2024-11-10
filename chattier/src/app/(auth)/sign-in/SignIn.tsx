"use client"

import { trpc } from "@/app/_trpc/client"
import { handleSocialSignIn, signInWithEmailOnClient } from "@/auth/client"
import Google from "@/components/icons/Google"
import Pie from "@/components/icons/Pie"
import LoadingCanvas from "@/components/LoadingCanvas"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  SignInCredentialsValidator,
  TSignInCredentialsValidator,
} from "@/lib/validators"
import { zodResolver } from "@hookform/resolvers/zod"
import { GoogleAuthProvider } from "firebase/auth"
import { ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

/**
 * A React component that handles the sign-in process, including both email/password and social provider sign-ins.
 *
 * @param {{ origin?: string }} props - The component props.
 * @param {string} [props.origin] - The optional origin URL to redirect to after sign-in.
 * @returns {JSX.Element} The rendered sign-in component.
 */
const SignIn = ({ origin }: { origin?: string }): JSX.Element => {
  const router = useRouter()
  const [isSigningInWithEmail, setIsSigningInWithEmail] =
    useState<boolean>(false)
  const [isSigningInWithProvider, setIsSigningInWithProvider] =
    useState<boolean>(false)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TSignInCredentialsValidator>({
    resolver: zodResolver(SignInCredentialsValidator),
  })

  const { mutate: signInWithEmailOnServer } =
    trpc.auth.signInWithEmail.useMutation({
      onSuccess: async () => {
        toast.success("Signed in successfully.")

        startTransition(() => {
          if (origin) {
            router.push(origin)
          } else {
            router.push("/dashboard")
          }
          router.refresh()
        })

        setIsSigningInWithEmail(false)
      },
      onError: (error) => {
        setIsSigningInWithEmail(false)
        toast.error(error.message)
      },
    })

  const { mutate: signInWithProviderOnServer } =
    trpc.auth.signInWithProvider.useMutation({
      onSuccess: () => {
        toast.success("Signed in successfully.")

        startTransition(() => {
          if (origin) {
            router.push(origin)
          } else {
            router.push("/dashboard")
          }
          router.refresh()
        })

        setIsSigningInWithProvider(false)
      },
      onError: () => {
        setIsSigningInWithProvider(false)
        toast.error("Something went wrong. Try again.")
      },
    })

  /**
   * Handles the form submission for email and password sign-in.
   *
   * @param {TSignInCredentialsValidator} email - The user's email.
   * @param {TSignInCredentialsValidator} password - The user's password.
   */
  const onSubmit = async ({ email, password }: TSignInCredentialsValidator) => {
    setIsSigningInWithEmail(true)

    try {
      const { idToken } = await signInWithEmailOnClient({ email, password })
      signInWithEmailOnServer({ idToken })
    } catch (error) {
      setIsSigningInWithEmail(false)
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

    setIsSigningInWithProvider(true)

    try {
      const { userId, name, idToken, email } = await handleSocialSignIn(
        provider
      )
      signInWithProviderOnServer({ userId, name, idToken, email })
    } catch (error) {
      setIsSigningInWithProvider(false)

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
                Sign in to your account
              </h1>

              <Link
                className={buttonVariants({
                  variant: "link",
                  className: "gap-1.5",
                })}
                href="/sign-up"
              >
                Don&apos;t have an account? Sign-up
                <ArrowRight className="h-4 w-4" />
              </Link>
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

                  <div className="grid py-2">
                    <div className="grid gap-1">
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
                    <div className="w-full flex items-center justify-end">
                      <Link
                        className={buttonVariants({
                          variant: "link",
                          className: "text-xs p-0 m-0",
                        })}
                        href="/reset-password"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  <Button
                    disabled={isSigningInWithEmail || isSigningInWithProvider}
                    className="mt-4"
                  >
                    {isSigningInWithEmail ? (
                      <Loader2 className="animate-spin text-white" />
                    ) : (
                      <p className="text-white">Sign In</p>
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
                  disabled={isSigningInWithEmail || isSigningInWithProvider}
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

export default SignIn
