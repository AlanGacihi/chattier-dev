"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { trpc } from "../_trpc/client"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { usePostHog } from "posthog-js/react"

/**
 * Props for the DeleteChat component.
 * @interface DeleteChatProps
 * @property {string} chatId - The ID of the chat to be deleted.
 * @property {() => void} onActionComplete - A callback function to be called when the delete action is completed.
 */
interface DeleteChatProps {
  chatId: string
  onActionComplete: () => void
}

/**
 * A component for deleting a chat.
 * @param {DeleteChatProps} props - The props for the DeleteChat component.
 * @param {string} props.chatId - The ID of the chat to be deleted.
 * @param {() => void} props.onActionComplete - A callback function to be called when the delete action is completed.
 * @returns {JSX.Element} The rendered DeleteChat component.
 */
const DeleteChat = ({
  chatId,
  onActionComplete,
}: DeleteChatProps): JSX.Element => {
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string | null>(
    null
  )

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: deleteSelectedChat } = trpc.chat.deleteChat.useMutation({
    onSuccess: () => {
      setCurrentlyDeleting(null)

      toast.success("Chat deleted successfully.")
    },
    onMutate: async ({ chatId }) => {
      setCurrentlyDeleting(chatId)

      await utils.chat.getUserChats.cancel()

      const previousChats = utils.chat.getUserChats.getInfiniteData({
        limit: INFINITE_QUERY_LIMIT,
      })

      utils.chat.getUserChats.setInfiniteData(
        {
          limit: INFINITE_QUERY_LIMIT,
        },
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              chats: page.chats.filter((chat) => chat.id !== chatId),
            })),
          }
        }
      )

      onActionComplete()

      return { previousChats }
    },
    onError: (_, __, context) => {
      setCurrentlyDeleting(null)

      if (context?.previousChats) {
        utils.chat.getUserChats.setInfiniteData(
          {
            limit: INFINITE_QUERY_LIMIT,
          },
          context.previousChats
        )
      }

      toast.error("Something went wrong. Try again in a moment.")
    },
    onSettled: async () => {
      await utils.chat.getUserChats.invalidate()
    },
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {currentlyDeleting === chatId ? (
          <div className="flex h-8 w-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-red-400" />
          </div>
        ) : (
          <button
            disabled={currentlyDeleting === chatId}
            className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200"
          >
            Delete
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the chat
            and remove the data including all analyses and associated shared
            links from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className={cn(
              buttonVariants({
                variant: "destructive",
              })
            )}
            onClick={() => {
              deleteSelectedChat({ chatId })
              posthog.capture("Chat Delete")
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteChat
