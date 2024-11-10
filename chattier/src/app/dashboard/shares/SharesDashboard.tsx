"use client"

import { trpc } from "@/app/_trpc/client"
import Bouncy from "@/components/ldrs/Bouncy"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
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
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { useIntersection } from "@mantine/hooks"
import { Ghost, Loader2, MoreHorizontal } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import ShareCard from "./ShareCard"
import { usePostHog } from "posthog-js/react"

/**
 * A React component that renders the shares dashboard.
 *
 * @returns {JSX.Element} The rendered shares dashboard component.
 */
const SharesDashboard = (): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentlyDeleting, setCurrentlyDeleting] = useState<boolean>(false)
  const lastShareRef = useRef<HTMLDivElement>(null)

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    trpc.share.getUserLinks.useInfiniteQuery(
      {
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    )

  const { ref, entry } = useIntersection({
    root: lastShareRef.current,
    threshold: 1,
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  const shares = data?.pages.flatMap((page) => page.shares) ?? []

  const { mutate: deleteAllLinks } = trpc.share.deleteAll.useMutation({
    onSuccess: async () => {
      setCurrentlyDeleting(false)
      await utils.share.getUserLinks.invalidate()
      await utils.share.getId.invalidate()
      toast.success("Share links deleted successfully.")
    },
    onMutate: async () => {
      setCurrentlyDeleting(true)

      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await utils.share.getUserLinks.cancel()

      // Snapshot the previous value
      const previousShares = utils.share.getUserLinks.getInfiniteData({
        limit: INFINITE_QUERY_LIMIT,
      })

      // Optimistically update to the new value
      utils.share.getUserLinks.setInfiniteData(
        { limit: INFINITE_QUERY_LIMIT },
        (old) => {
          if (!old) return old
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              shares: [],
            })),
          }
        }
      )

      // Return a context object with the snapshotted value
      return { previousShares }
    },
    onError: (err, newShares, context) => {
      setCurrentlyDeleting(false)
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousShares) {
        utils.share.getUserLinks.setInfiniteData(
          { limit: INFINITE_QUERY_LIMIT },
          context.previousShares
        )
      }
      toast.error("Something went wrong. Try again in a moment.")
    },
    onSettled: async () => {
      // Sync with the server once mutation has settled
      await utils.share.getUserLinks.invalidate()
    },
  })

  return (
    <MaxWidthWrapper className="flex-1 flex flex-col min-h-screen pb-8">
      <div className="flex flex-col items-start sm:items-center border-b mt-8 sm:mt-12 lg:flex-row justify-between gap-y-6 pb-4">
        <h1 className="mb-3 font-bold text-5xl text-gray-800">
          My Shared Links
        </h1>
        <DropdownMenu
          open={isOpen}
          onOpenChange={(v) => {
            if (!v) {
              setIsOpen(v)
            }
          }}
        >
          <DropdownMenuTrigger onClick={() => setIsOpen(true)} asChild>
            <Button variant="outline" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4 text-gray-500" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="max-w-48">
            <DropdownMenuLabel className="text-gray-700">
              Actions
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {currentlyDeleting ? (
                    <div className="flex h-8 w-full items-center justify-center">
                      <Loader2 className="size-5 animate-spin text-red-400" />
                    </div>
                  ) : (
                    <button
                      disabled={
                        currentlyDeleting || !shares || shares.length === 0
                      }
                      className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200"
                    >
                      Delete all shared links
                    </button>
                  )}
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all the links and remove the data from our servers.
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
                        deleteAllLinks()
                        posthog.capture("Share Links Delete All")
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div
              key={i}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white"
            >
              <div className="flex flex-row items-center gap-x-6 px-6 pt-4">
                <Skeleton className="size-8 sm:size-10 rounded-full bg-slate-200" />
                <Skeleton className="h-6 w-[180px] sm:w-[250px] md:w-[300px] lg:w-[350px] bg-slate-200" />
              </div>

              <div className="px-6 mt-4 flex flex-row items-center justify-between py-3">
                <Skeleton className="h-6 w-[120px] bg-slate-200" />
                <Skeleton className="h-6 w-[50px] bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : shares.length > 0 ? (
        <>
          <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2">
            {shares.map((share, i) => (
              <ShareCard
                key={share.id}
                ref={i === shares.length - 1 ? ref : undefined}
                share={share}
              />
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center mt-8">
              <Bouncy />
            </div>
          )}
        </>
      ) : (
        <div className="mt-28 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Share your first chat analysis.</p>
        </div>
      )}
    </MaxWidthWrapper>
  )
}

export default SharesDashboard
