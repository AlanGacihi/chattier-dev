"use client"

import { trpc } from "@/app/_trpc/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy, Link as LucideLink, Share2, XCircle } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import Bouncy from "./ldrs/Bouncy"
import { Input } from "./ui/input"
import { usePostHog } from "posthog-js/react"

/**
 * Props for the ShareButton component.
 * @interface ShareButtonProps
 * @property {string} chatId - The ID of the chat associated with the share button.
 * @property {string} analysisId - The ID of the analysis associated with the share button.
 * @property {boolean} [isOnDropdown=false] - Optional flag indicating whether the button is part of a dropdown menu.
 */
interface ShareButtonProps {
  chatId: string
  analysisId: string
  isOnDropdown?: boolean
}

/**
 * A button component used to share a chat analysis.
 * @param {ShareButtonProps} props - The props for the ShareButton component.
 * @param {string} props.chatId - The ID of the chat associated with the share button.
 * @param {string} props.analysisId - The ID of the analysis associated with the share button.
 * @param {boolean} [props.isOnDropdown=false] - Optional flag indicating whether the button is part of a dropdown menu.
 * @returns {JSX.Element} The rendered ShareButton component.
 */
const ShareButton = ({
  chatId,
  analysisId,
  isOnDropdown = false,
}: ShareButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [isUpdating, setIsUpdating] = useState<boolean>(false)
  const [isCopying, setIsCopying] = useState<boolean>(false)
  const [gotError, setGotError] = useState<boolean>(false)

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const {
    data: existingShareId,
    isLoading,
    isError,
  } = trpc.share.getId.useQuery({
    chatId,
    analysisId,
  })

  const { mutate: updateLink } = trpc.share.updateId.useMutation({
    onSuccess: ({ shareId }) => {
      setShareLink(`${process.env.NEXT_PUBLIC_BASE_URL}/share/${shareId}`)
      setIsUpdating(false)
    },
    onMutate: () => {
      setIsUpdating(true)
    },
    onError: () => {
      setIsUpdating(false)
      setGotError(true)
    },
  })

  const { mutate: generateLink } = trpc.share.generateId.useMutation({
    onSuccess: ({ shareId }) => {
      setShareLink(`${process.env.NEXT_PUBLIC_BASE_URL}/share/${shareId}`)
      setIsCreating(false)
      utils.share.getUserLinks.invalidate()
    },
    onMutate: () => {
      setIsCreating(true)
    },
    onError: () => {
      setIsCreating(false)
      setGotError(true)
    },
  })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
          setShareLink(null)
          setGotError(false)
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true)
          posthog.capture("Share Button Click")
        }}
        asChild
      >
        {isOnDropdown ? (
          <button className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200">
            Share
          </button>
        ) : (
          <Button size="sm">
            <div className="flex gap-x-3 items-center mr-2">
              <Share2 /> <p className="text-white">Share</p>
            </div>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-8">
            <Bouncy size={45} />
          </div>
        ) : gotError || isError ? (
          <div className="flex items-center justify-center h-48 space-x-4">
            <XCircle className="h-10 w-10 text-red-400" />
            <p>Something went wrong. Try again in a moment.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share link to your chat analysis</DialogTitle>
              <DialogDescription>
                You can share a link to your chat analysis here.
              </DialogDescription>
            </DialogHeader>
            <div className="relative my-2">
              <Input
                placeholder={`${process.env.NEXT_PUBLIC_BASE_URL}/share/...`}
                className="h-14 rounded-full pr-24 text-gray-600 relative"
                readOnly={true}
                value={shareLink ?? ""}
                autoFocus={false}
              />

              {shareLink ? (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white backdrop-blur-sm rounded-full pl-3">
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      navigator.clipboard.writeText(shareLink)
                      setIsCopying(true)
                      setTimeout(() => setIsCopying(false), 1000)
                      posthog.capture("Share Link Copy")
                    }}
                    disabled={isCopying}
                  >
                    {isCopying ? (
                      "Copied!"
                    ) : (
                      <div className="flex gap-x-2 items-center">
                        <Copy className="size-4 text-white" />
                        <p>Copy link</p>
                      </div>
                    )}
                  </Button>
                </div>
              ) : existingShareId ? (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white backdrop-blur-sm rounded-full pl-3">
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      updateLink({
                        chatId,
                        analysisId,
                        shareId: existingShareId,
                      })
                      posthog.capture("Share Link Update")
                    }}
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      "Updating..."
                    ) : (
                      <div className="flex gap-x-2 items-center">
                        <LucideLink className="size-4 text-white" />
                        <p>Update link</p>
                      </div>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white backdrop-blur-sm rounded-full pl-3">
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      generateLink({ chatId, analysisId })
                      posthog.capture("Share Link Generate")
                    }}
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      "Generating..."
                    ) : (
                      <div className="flex gap-x-2 items-center">
                        <LucideLink className="size-4 text-white" />
                        <p>Generate link</p>
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <DialogFooter>
              {existingShareId ? (
                <p className="text-xs text-muted-foreground inline ">
                  A past version of this chat analysis has already been shared.
                  Manage previously shared chat analyses via{" "}
                  <Link href={`/dashboard/shares`} className="underline">
                    shared
                  </Link>
                  .
                </p>
              ) : (
                <p className="text-xs text-muted-foreground inline w-full">
                  Manage previously shared chat analyses via{" "}
                  <Link href={`/dashboard/shares`} className="underline">
                    shared
                  </Link>
                  .
                </p>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShareButton
