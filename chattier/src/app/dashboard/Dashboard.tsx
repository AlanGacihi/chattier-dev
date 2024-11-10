"use client"

import Bouncy from "@/components/ldrs/Bouncy"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { Skeleton } from "@/components/ui/skeleton"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { useIntersection } from "@mantine/hooks"
import { Ghost, XCircle } from "lucide-react"
import { useEffect, useRef } from "react"
import UploadButton from "../../components/UploadButton"
import { trpc } from "../_trpc/client"
import ChatCard from "./ChatCard"

interface DashboardProps {
  userId: string
  userPublicKey: string
}

const Dashboard = ({ userId, userPublicKey }: DashboardProps): JSX.Element => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage, isError } =
    trpc.chat.getUserChats.useInfiniteQuery(
      {
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
      }
    )

  const lastChatRef = useRef<HTMLDivElement>(null)

  const { ref, entry } = useIntersection({
    root: lastChatRef.current,
    threshold: 1,
  })

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage])

  const chats = data?.pages.flatMap((page) => page.chats) ?? []

  return (
    <MaxWidthWrapper className="flex-1 flex flex-col min-h-screen">
      <div className="flex flex-col items-start sm:items-center border-b mt-8 sm:mt-12 lg:flex-row justify-between gap-y-6 pb-4">
        <h1 className="mb-3 font-bold text-5xl text-gray-800">My Chats</h1>
        <UploadButton
          name="New Chat"
          userId={userId}
          userPublicKey={userPublicKey}
        />
      </div>

      {isError ? (
        <div className="flex justify-center items-center h-60 space-x-4">
          <XCircle className="h-10 w-10 text-red-400" />
          <p className="text-lg text-gray-600">
            Something went wrong. Try again.
          </p>
        </div>
      ) : isLoading ? (
        <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-center pt-4">
                <div className="px-6 flex w-full items-center gap-x-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                  <Skeleton className="h-6 w-[120px] sm:w-[140px] md:w-[w-160] bg-slate-200" />
                </div>

                <div className="px-6">
                  <Skeleton className="h-6 w-[35px] bg-slate-200" />
                </div>
              </div>

              <div className="px-6 mt-4 flex flex-row items-center justify-between py-3">
                <Skeleton className="h-6 w-[95px] bg-slate-200" />
                <Skeleton className="h-6 w-[95px] bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : chats.length > 0 ? (
        <>
          <div className="mt-8 mb-16 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
            {chats.map((chat, i) => (
              <ChatCard
                key={chat.id}
                ref={i === chats.length - 1 ? ref : undefined}
                chat={chat}
                userId={userId}
              />
            ))}
          </div>
          {isFetchingNextPage && (
            <div className="flex justify-center my-8">
              <Bouncy />
            </div>
          )}
        </>
      ) : (
        <div className="mt-28 flex flex-col items-center gap-2">
          <Ghost className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">Pretty empty around here</h3>
          <p>Let&apos;s upload your first chat.</p>
        </div>
      )}
    </MaxWidthWrapper>
  )
}

export default Dashboard
