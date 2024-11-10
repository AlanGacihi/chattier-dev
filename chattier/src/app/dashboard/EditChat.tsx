import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Button } from "@/components/ui/button"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { usePostHog } from "posthog-js/react"
import { useState } from "react"
import { toast } from "sonner"
import { trpc } from "../_trpc/client"

/**
 * Props for the EditChat component.
 * @interface EditChatProps
 * @property {string} chatId - The ID of the chat to be edited.
 * @property {() => void} onActionComplete - A callback function to be called when the edit action is completed.
 */
interface EditChatProps {
  chatId: string
  onActionComplete: () => void
}

/**
 * A React component that handles the editing of a chat.
 *
 * @param {EditChatProps} props - The component props.
 * @param {string} props.chatId - The chat ID.
 * @param {() => void} props.onActionComplete - The callback function to execute after the action is complete.
 * @returns {JSX.Element} The rendered component.
 */
const EditChat = ({ chatId, onActionComplete }: EditChatProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [newTitle, setNewTitle] = useState<string>("")

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: saveChatTitle } = trpc.chat.updateChatTitle.useMutation({
    onSuccess: () => {
      toast.success("Chat title updated successfully.")
    },
    onMutate: async ({ chatId, newTitle }) => {
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
              chats: page.chats.map((chat) =>
                chat.id === chatId ? { ...chat, title: newTitle } : chat
              ),
            })),
          }
        }
      )

      setIsOpen(false)
      onActionComplete()

      return { previousChats }
    },
    onError: (_, __, context) => {
      if (context?.previousChats) {
        utils.chat.getUserChats.setInfiniteData(
          {
            limit: INFINITE_QUERY_LIMIT,
          },
          context.previousChats
        )
      }

      toast.error("Failed to update chat title. Please try again.")
    },
    onSettled: async () => {
      await utils.chat.getUserChats.invalidate()
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <button className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200">
          Edit
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-gray-800">Edit Name</DialogTitle>
          <DialogDescription>
            Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-8 pt-4 pb-8">
          <div className="grid grid-cols-1 gap-y-2">
            <Label htmlFor="name" className="text-base text-gray-700">
              New name
            </Label>
            <Input onChange={(e) => setNewTitle(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button
            disabled={newTitle.length === 0}
            className="w-full"
            onClick={() => {
              saveChatTitle({
                chatId,
                newTitle,
              })
              posthog.capture("Chat Title Edit", {
                newTitle,
              })
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EditChat
