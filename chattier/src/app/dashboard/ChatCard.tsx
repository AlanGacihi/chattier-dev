"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Chat } from "@/types/types"
import { format } from "date-fns"
import { MoreVertical, PieChart, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, useState } from "react"
import DeleteChat from "./DeleteChat"
import EditChat from "./EditChat"

/**
 * A React component that renders a card for a chat room.
 *
 * @param {ChatCardProps} props - The component props.
 * @param {Chat} props.chat - The chat room data.
 * @param {string} props.userId - The user ID.
 * @returns {JSX.Element} The rendered chat card component.
 */
const ChatCard = forwardRef<
  HTMLDivElement,
  {
    chat: Chat
    userId: string
  }
>(({ chat, userId }, ref) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const closeDropdown = () => setIsOpen(false)

  return (
    <div
      ref={ref}
      className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
    >
      <div className="flex flex-row items-center justify-between pt-6">
        <Link
          href={`/dashboard/${chat.id}`}
          className="flex flex-col gap-2 w-5/6"
        >
          <div className="px-4 sm:px-6 flex flex-row w-full items-center gap-x-6">
            <div className="size-8 sm:size-10 flex-shrink-0 rounded-full bg-gradient-to-r from-cyan-300 to-green-600" />
            <div className="flex-1 truncate">
              <div className="flex items-center space-x-3">
                <h3 className="truncate text-base sm:text-xl font-medium text-zinc-800">
                  {chat.title}
                </h3>
              </div>
            </div>
          </div>
        </Link>
        <div className="pr-2 sm:pr-4">
          <DropdownMenu
            open={isOpen}
            onOpenChange={(v) => {
              if (!v) {
                setIsOpen(v)
              }
            }}
          >
            <DropdownMenuTrigger onClick={() => setIsOpen(true)} asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-48">
              <DropdownMenuLabel className="text-gray-700">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  onClick={() => router.push(`/dashboard/${chat.id}`)}
                  className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200"
                >
                  View
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <EditChat chatId={chat.id} onActionComplete={closeDropdown} />
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DeleteChat chatId={chat.id} onActionComplete={closeDropdown} />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="px-4 sm:px-6 mt-4 flex flex-row items-center justify-between py-3 text-xs text-zinc-500">
        <div className="flex items-center gap-2 w-full">
          <Plus className="h-5 w-5" />
          {format(chat.createdAt, "MMMM d, yyyy")}
        </div>

        <div className="flex items-center gap-2 py-0.5 text-xs">
          <PieChart className="size-4" />
          {chat.totalAnalyses}
        </div>
      </div>
    </div>
  )
})

ChatCard.displayName = "ChatCard"

export default ChatCard
