"use client"

import { trpc } from "@/app/_trpc/client"
import BackButton from "@/components/BackButton"
import Bouncy from "@/components/ldrs/Bouncy"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { Skeleton } from "@/components/ui/skeleton"
import UploadButton from "@/components/UploadButton"
import { INFINITE_QUERY_LIMIT } from "@/lib/constants"
import { Chat } from "@/types/types"
import { useIntersection } from "@mantine/hooks"
import { Badge } from "@tremor/react"
import { format } from "date-fns"
import { Ghost, Calendar as LucideCalendar } from "lucide-react"
import { useEffect, useRef } from "react"
import ChatAnalysisCard from "./ChatAnalysisCard"

/**
 * Props for the ChatAnalysesDashboard component.
 * @interface ChatAnalysesDashboardProps
 * @property {string} userId - The ID of the user whose chat analyses are being displayed.
 * @property {Chat} chat - The chat object containing details about the chat.
 */
interface ChatAnalysesDashboardProps {
  userId: string
  userPublicKey: string
  chat: Chat
}

/**
 * A React component that renders the chat analyses dashboard.
 *
 * @param {ChatAnalysesDashboardProps} props - The component props.
 * @param {string} props.userId - The user ID.
 * @param {Chat} props.chat - The chat object.
 * @returns {JSX.Element} The rendered chat analyses dashboard component.
 */
const ChatAnalysesDashboard = ({
  userId,
  userPublicKey,
  chat,
}: ChatAnalysesDashboardProps): JSX.Element => {
  const utils = trpc.useUtils()

  const { data: chatTimings } = trpc.chat.getChatTimings.useQuery({
    chatId: chat.id,
  })

  const { data, isLoading, fetchNextPage, isFetchingNextPage } =
    trpc.analysis.getUserChatAnalyses.useInfiniteQuery(
      {
        chatId: chat.id,
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

  const analyses = data?.pages.flatMap((page) => page.analyses) ?? []

  return (
    <MaxWidthWrapper className="flex-1 flex flex-col min-h-screen mb-12">
      <div className="flex flex-col items-start sm:items-center border-b mt-8 sm:mt-12 lg:flex-row justify-between gap-y-6 pb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-8 gap-y-6">
          <BackButton />
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="size-10 sm:size-12 flex-shrink-0 rounded-full bg-gradient-to-r from-indigo-300 via-teal-500 to-green-500" />
            <h2 className="text-xl sm:text-xl md:text-2xl lg:text-3xl font-semibold break-words">
              {chat.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-x-12 sm:flex-row gap-y-8 font-medium items-start sm:items-center">
          {analyses.length > 0 ? (
            <Badge size="md" color="indigo">
              <div className="flex flex-row space-x-3 py-1.5 items-center">
                <LucideCalendar className="size-4" />
                <p className="text-sm">{`${format(
                  chatTimings?.showStartDate ?? chat.showStartDate,
                  "MMM d, yyyy"
                )} - ${format(
                  chatTimings?.endDate ?? chat.endDate,
                  "MMM d, yyyy"
                )}`}</p>
              </div>
            </Badge>
          ) : null}

          <UploadButton
            name="New Analysis"
            userId={userId}
            chatId={chat.id}
            userPublicKey={userPublicKey}
            minAnalysisCutoffDate={chatTimings?.endDate ?? chat.endDate}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-center justify-between py-4">
                <div className="px-6 flex w-full items-center gap-x-4">
                  <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                  <Skeleton className="h-6 w-[120px] lg:w-[140px] bg-slate-200" />
                </div>

                <div className="px-6">
                  <Skeleton className="h-6 w-[35px] bg-slate-200" />
                </div>
              </div>
              <div className="px-6 pt-5 flex flex-col items-center justify-between text-sm font-medium text-zinc-500 gap-y-4">
                <div className="w-full flex items-center justify-between">
                  <Skeleton className="h-5 w-[110px] bg-slate-200" />
                  <Skeleton className="h-5 w-[60px] bg-slate-200" />
                </div>
                <div className="w-full flex items-center justify-between">
                  <Skeleton className="h-5 w-[110px] bg-slate-200" />
                  <Skeleton className="h-5 w-[60px] bg-slate-200" />
                </div>
                <div className="w-full flex items-center justify-between">
                  <Skeleton className="h-5 w-[110px] bg-slate-200" />
                  <Skeleton className="h-5 w-[60px] bg-slate-200" />
                </div>
                <div className="w-full flex items-center justify-between">
                  <Skeleton className="h-5 w-[110px] bg-slate-200" />
                  <Skeleton className="h-5 w-[60px] bg-slate-200" />
                </div>
              </div>
              <div className="flex items-center mt-6 px-6 py-4 gap-2 justify-between text-sm font-medium text-zinc-500">
                <Skeleton className="h-5 w-[60px] bg-slate-200" />
                <Skeleton className="h-5 w-[110px] bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : analyses.length > 0 ? (
        <>
          <div className="my-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3">
            {analyses.map((chatAnalysis, i) => (
              <ChatAnalysisCard
                key={chatAnalysis.id}
                ref={i === analyses.length - 1 ? ref : undefined}
                userId={userId}
                chatId={chat.id}
                chatAnalysis={chatAnalysis}
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
          <p>Let&apos;s upload your first analysis.</p>
        </div>
      )}
    </MaxWidthWrapper>
  )
}

export default ChatAnalysesDashboard
