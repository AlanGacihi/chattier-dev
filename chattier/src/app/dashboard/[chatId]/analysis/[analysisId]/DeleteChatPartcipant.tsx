"use client"

import { trpc } from "@/app/_trpc/client"
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
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { usePostHog } from "posthog-js/react"

interface DeleteChatPartcipantProps {
  chatId: string
  analysisId: string
  participantId: string
  onActionComplete: () => void
}

const DeleteChatPartcipant = ({
  chatId,
  analysisId,
  participantId,
  onActionComplete,
}: DeleteChatPartcipantProps) => {
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string | null>(
    null
  )

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: deleteParticipant } =
    trpc.analysis.deleteChatPartcipant.useMutation({
      onSuccess: () => {
        utils.analysis.getUserChatAnalysis.invalidate()
        setCurrentlyDeleting(null)
        onActionComplete()
        toast.success("Chat user deleted successfully.")
      },
      onMutate: () => {
        setCurrentlyDeleting(participantId)
      },
      onError: () => {
        setCurrentlyDeleting(null)
        toast.error("Something went wrong. Try again.")
      },
    })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {currentlyDeleting === participantId ? (
          <div className="flex h-8 w-full items-center justify-center">
            <Loader2 className="size-5 animate-spin text-red-400" />
          </div>
        ) : (
          <button
            disabled={currentlyDeleting === participantId}
            className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200"
          >
            Delete user
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the user
            and remove the data from our servers.
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
              deleteParticipant({ chatId, analysisId, participantId })
              posthog.capture("Chat Participant Delete")
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteChatPartcipant
