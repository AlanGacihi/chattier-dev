import { getUserSubscriptionPlan } from "@/lemonsqueezy/actions"
import { User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"

/**
 * Props for the UserAccountNav component.
 * @interface UserAccountNavProps
 * @property {string | undefined} email - The email address of the user. It can be undefined if not available.
 * @property {string} name - The name of the user.
 * @property {string} photoUrl - The URL of the user's profile photo.
 */
interface UserAccountNavProps {
  email: string | undefined
  name: string
  photoUrl: string
}

/**
 * A component for displaying user account navigation details.
 * @param {UserAccountNavProps} props - The props for the UserAccountNav component.
 * @param {string | undefined} props.email - The email address of the user. It can be undefined if not available.
 * @param {string} props.name - The name of the user.
 * @param {string} props.photoUrl - The URL of the user's profile photo.
 * @returns {Promise<JSX.Element>} A promise that resolves to the rendered UserAccountNav component.
 */
const UserAccountNav = async ({
  email,
  photoUrl,
  name,
}: UserAccountNavProps): Promise<JSX.Element> => {
  const subscriptionPlan = await getUserSubscriptionPlan()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full size-8 aspect-square bg-slate-400">
          <Avatar className="relative size-8">
            {photoUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Image
                  fill
                  src={photoUrl}
                  alt="profile picture"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <User className="size-4 text-zinc-900" />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="w-[200px] truncate text-xs text-zinc-700">
                {email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/dashboard/shares">Shared Links</Link>
        </DropdownMenuItem>

        {/* <DropdownMenuItem asChild>
          {subscriptionPlan?.isSubscribed ? (
            <Link href="/dashboard/billing">Manage Subscription</Link>
          ) : (
            <Link href="/pricing">
              Upgrade <Gem className="text-indigo-600 h-4 w-4 ml-1.5" />
            </Link>
          )}
        </DropdownMenuItem> */}

        <DropdownMenuSeparator />

        <DropdownMenuItem className="cursor-pointer">
          <Link href="/sign-out">Sign out</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserAccountNav
