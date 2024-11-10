import { getCurrentUser } from "@/auth/server"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import MaxWidthWrapper from "./MaxWidthWrapper"
import MobileNav from "./MobileNav"
import { buttonVariants } from "./ui/button"
import UserAccountNav from "./UserAccountNav"
import { ExtendedUser } from "@/types/types"

/**
 * A server-side rendered navigation bar component that dynamically displays
 * user-related links based on the user's authentication status.
 *
 * @returns {Promise<JSX.Element>} The rendered navigation bar component.
 */
const Navbar = async ({
  user,
}: {
  user: ExtendedUser | null
}): Promise<JSX.Element> => {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all z-[40]">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href="/" className="flex z-40 font-semibold">
            <span className="text-green-600">chattier.</span>
          </Link>

          <MobileNav isAuth={!!user} />

          <div className="hidden items-center space-x-4 sm:flex">
            {!user ? (
              <>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/pricing"
                >
                  Pricing
                </Link>
                <Link
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                  href="/sign-in"
                >
                  Sign in
                </Link>
                <Link
                  className={buttonVariants({
                    size: "sm",
                  })}
                  href="/sign-up"
                  target="_blank"
                >
                  Get started <ArrowRight className="ml-1.5 h-5 w-5" />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className={buttonVariants({
                    variant: "ghost",
                    size: "sm",
                  })}
                >
                  Dashboard
                </Link>

                <UserAccountNav
                  name={!user.name ? "Your Account" : `${user.name}`}
                  email={user.email ?? ""}
                  photoUrl={user.photoURL ?? ""}
                />
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  )
}

export default Navbar
