"use client"

import { ArrowRight, Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

/**
 * A mobile navigation component that displays a menu with different options based on the user's authentication status.
 * The menu is toggled open and closed by clicking a menu icon, and it automatically closes when the pathname changes.
 *
 * @param {Object} props - The component props.
 * @param {boolean} props.isAuth - A boolean indicating whether the user is authenticated.
 *                                 If `true`, the menu will display authenticated user options; otherwise, it will display guest options.
 *
 * @returns {JSX.Element} The rendered mobile navigation menu.
 */

const MobileNav = ({ isAuth }: { isAuth: boolean }): JSX.Element => {
  const [isOpen, setOpen] = useState<boolean>(false)
  const toggleOpen = () => setOpen((prev) => !prev)
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) toggleOpen()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen()
    }
  }

  return (
    <div className="sm:hidden">
      <Menu
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-full">
          <ul className="absolute bg-white border-b border-zinc-200 shadow-xl grid w-full gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-up")}
                    className="flex items-center w-full font-semibold text-green-600"
                    href="/sign-up"
                  >
                    Get started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/sign-in")}
                    className="flex items-center w-full font-semibold"
                    href="/sign-in"
                  >
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link
                    className="flex items-center w-full font-semibold"
                    href="/pricing"
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold"
                    href="/dashboard"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="h-px w-full bg-gray-100" />
                <li>
                  <Link
                    onClick={() => closeOnCurrent("/dashboard")}
                    className="flex items-center w-full font-semibold"
                    href="/dashboard/shares"
                  >
                    Shared Links
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-400" />
                <li>
                  <Link
                    className="flex items-center w-full font-semibold"
                    href="/sign-out"
                  >
                    Sign out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}

export default MobileNav
