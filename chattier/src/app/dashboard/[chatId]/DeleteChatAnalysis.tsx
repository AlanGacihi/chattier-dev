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
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { usePostHog } from "posthog-js/react"

interface DeleteChatProps {
  chatId: string
  analysisId: string
  startDate: Date
  endDate: Date
  onActionComplete: () => void
}

const DeleteChatAnalysis = ({
  chatId,
  analysisId,
  startDate,
  endDate,
  onActionComplete,
}: DeleteChatProps): JSX.Element => {
  const [currentlyDeleting, setCurrentlyDeleting] = useState<string | null>(
    null
  )

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: deleteSelectedChatAnalysis } =
    trpc.analysis.deleteById.useMutation({
      onSuccess: () => {
        setCurrentlyDeleting(null)
        onActionComplete()
        utils.chat.getChatTimings.invalidate()
        toast.success("Chat analysis deleted successfully.")
      },
      onMutate: async ({ analysisId }) => {
        setCurrentlyDeleting(analysisId)

        await utils.analysis.getUserChatAnalyses.cancel()

        const previousAnalyses =
          utils.analysis.getUserChatAnalyses.getInfiniteData({
            chatId,
            limit: INFINITE_QUERY_LIMIT,
          })

        utils.analysis.getUserChatAnalyses.setInfiniteData(
          {
            chatId,
            limit: INFINITE_QUERY_LIMIT,
          },
          (oldData) => {
            if (!oldData) return oldData
            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                analyses: page.analyses.filter(
                  (analysis) => analysis.id !== analysisId
                ),
              })),
            }
          }
        )

        return { previousAnalyses }
      },
      onError: (_, __, context) => {
        setCurrentlyDeleting(null)

        if (context?.previousAnalyses) {
          utils.analysis.getUserChatAnalyses.setInfiniteData(
            {
              chatId,
              limit: INFINITE_QUERY_LIMIT,
            },
            context.previousAnalyses
          )
        }

        toast.error("Something went wrong. Try again in a moment.")
      },
      onSettled: async () => {
        await utils.analysis.getUserChatAnalyses.invalidate()
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
            analysis and remove the data including all associated shared links
            from our servers.
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
              deleteSelectedChatAnalysis({
                chatId,
                analysisId,
                startDate,
                endDate,
              })
              posthog.capture("Chat Analysis Delete")
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default DeleteChatAnalysis
