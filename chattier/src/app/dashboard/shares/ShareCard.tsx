"use client"

import { trpc } from "@/app/_trpc/client"
import ArrowUpRightSquare from "@/components/icons/ArrowUpRightSquare"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Share } from "@/types/types"
import { format } from "date-fns"
import { Loader2, Link as LucideLink, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { forwardRef, useState } from "react"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { usePostHog } from "posthog-js/react"

const ShareCard = forwardRef<
  HTMLDivElement,
  {
    share: Share
  }
>(({ share }, ref) => {
  const [currentlyDeletingShare, setCurrentlyDeletingShare] = useState<
    string | null
  >(null)

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: deleteSelectedLink } = trpc.share.deleteById.useMutation({
    onSuccess: async () => {
      setCurrentlyDeletingShare(null)
      await utils.share.getId.invalidate()
      toast.success("Share link deleted successfully.")
    },
    onMutate: async ({ shareId }) => {
      setCurrentlyDeletingShare(shareId)

      // Cancel any outgoing refetches
      await utils.share.getUserLinks.cancel()

      // Snapshot the previous value
      const previousShares = utils.share.getUserLinks.getInfiniteData({
        limit: INFINITE_QUERY_LIMIT,
      })

      // Optimistically update to the new value
      utils.share.getUserLinks.setInfiniteData(
        { limit: INFINITE_QUERY_LIMIT },
        (oldData) => {
          if (!oldData) return oldData
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              shares: page.shares.filter((share) => share.id !== shareId),
            })),
          }
        }
      )

      return { previousShares }
    },
    onError: (_, __, context) => {
      setCurrentlyDeletingShare(null)

      if (context?.previousShares) {
        utils.share.getUserLinks.setInfiniteData(
          { limit: INFINITE_QUERY_LIMIT },
          context.previousShares
        )
      }

      toast.error("Something went wrong. Try again in a moment.")
    },
    onSettled: async () => {
      await utils.share.getUserLinks.invalidate()
    },
  })

  return (
    <div
      ref={ref}
      className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
    >
      <Link href={`/share/${share.id}`} target="_blank">
        <div className="pt-6 px-4 sm:px-6 flex w-full items-center justify-between">
          <div className="size-8 sm:size-10 flex items-center justify-center flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-300 via-teal-500 to-green-500">
            <LucideLink className="text-white size-3 sm:size-4" />
          </div>
          <div className="flex-1 truncate">
            <Button
              variant={"link"}
              className="flex w-full items-center justify-start space-x-3 truncate"
            >
              <h3 className="truncate text-base font-medium text-zinc-700">
                {share.title}
              </h3>
              <div className="flex items-center justify-center flex-shrink-0">
                <ArrowUpRightSquare className="ml-1.5 text-zinc-600 size-5 sm:size-6" />
              </div>
            </Button>
          </div>
        </div>
      </Link>

      <div className="px-4 sm:px-6 mt-4 flex items-center justify-between py-2 gap-6 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {format(share.createdAt as Date, "MMMM d, yyyy")}
        </div>

        <Button
          size="sm"
          variant="destructive"
          disabled={currentlyDeletingShare === share.id}
          onClick={() => {
            deleteSelectedLink({ shareId: share.id })
            posthog.capture("Share Link Delete")
          }}
        >
          {currentlyDeletingShare === share.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
})

ShareCard.displayName = "ShareCard"

export default ShareCard
