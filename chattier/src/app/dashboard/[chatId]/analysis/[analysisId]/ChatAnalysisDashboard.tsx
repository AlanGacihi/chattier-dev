"use client"

import { trpc } from "@/app/_trpc/client"
import BackButton from "@/components/BackButton"
import Pie from "@/components/icons/Pie"
import Bouncy from "@/components/ldrs/Bouncy"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import { cn } from "@/lib/utils"
import { Badge } from "@tremor/react"
import { format } from "date-fns"
import { Ghost, Users, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import Confetti from "react-dom-confetti"
import { ChatPartcipantCard } from "../../../../../components/ChatParticipantCard"
import ShareButton from "../../../../../components/ShareButton"

interface ChatAnalysisDashboardProps {
  chatId: string
  analysisId: string
  isNew: boolean
}

const ChatAnalysisDashboard = ({
  chatId,
  analysisId,
  isNew,
}: ChatAnalysisDashboardProps): JSX.Element => {
  const [showConfetti, setShowConfetti] = useState<boolean>(false)

  const {
    data: chatAnalysis,
    isLoading,
    isError,
  } = trpc.analysis.getUserChatAnalysis.useQuery(
    {
      chatId,
      analysisId,
    },
    {
      refetchInterval: 2000,
    }
  )

  useEffect(
    () => setShowConfetti(isNew && !isLoading && !isError),
    [isNew, isLoading, isError]
  )

  return (
    <MaxWidthWrapper className="flex-1 flex flex-col">
      <div
        aria-hidden="true"
        className="pointer-events-none select-none absolute inset-0 overflow-hidden flex justify-center z-50"
      >
        <Confetti
          active={showConfetti}
          config={{
            elementCount: 200,
            spread: 360,
          }}
        />
      </div>

      {chatAnalysis ? (
        <>
          <div className="flex flex-col w-full items-start sm:items-center border-b mt-8 sm:mt-12 lg:flex-row justify-between gap-y-6 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-10 gap-y-6">
              <BackButton isNewAnalysis={isNew} />
              <div className="flex items-center gap-4 sm:gap-6">
                <Pie height={50} width={50} className="flex-shrink-0" />
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold break-words">
                  {`${format(chatAnalysis.startDate, "PPP")} - ${format(
                    chatAnalysis.endDate,
                    "PPP"
                  )}`}
                </h2>
              </div>
            </div>

            <div className="flex flex-col gap-x-12 sm:flex-row gap-y-8 font-medium items-start sm:items-center">
              <div className="flex flex-col gap-x-4 sm:flex-row gap-y-4 font-medium items-start sm:items-center">
                <Badge size="md" color="indigo">
                  <div className="flex flex-row space-x-4 py-0.5 items-center">
                    <Users className="size-6" />
                    <p className="text-sm sm:text-base">
                      {chatAnalysis.totalPartcipants}
                    </p>
                  </div>
                </Badge>
              </div>
              <div className="flex font-medium items-center">
                {chatAnalysis && chatAnalysis.status !== "ERROR" ? (
                  <ShareButton chatId={chatId} analysisId={analysisId} />
                ) : null}
              </div>
            </div>
          </div>

          {chatAnalysis.totalPartcipants > 0 ? (
            <div className="mt-12 mb-28 grid grid-cols-1 gap-y-12 w-full md:grid-cols-2 sm:gap-x-6 lg:gap-x-8 justify-items-center">
              {chatAnalysis.participants.map((participant, i) => (
                <ChatPartcipantCard
                  key={i}
                  participant={participant}
                  chatId={chatId}
                  analysisId={analysisId}
                  status={chatAnalysis.status}
                  progress={chatAnalysis.progress}
                  numParticipants={chatAnalysis.totalPartcipants}
                  showDropDown={true}
                />
              ))}
            </div>
          ) : (
            <div className="mt-28 flex flex-col items-center gap-2">
              <Ghost className="h-8 w-8 text-zinc-800" />
              <h3 className="font-semibold text-xl">
                Pretty empty around here
              </h3>
              <p>All chat participants have been deleted.</p>
            </div>
          )}
        </>
      ) : isLoading ? (
        <div className="flex flex-col w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
          <Bouncy />
        </div>
      ) : isError ? (
        <div className="flex justify-center items-center h-48 space-x-4">
          <XCircle className="h-10 w-10 text-red-400" />
          <p className="text-lg text-gray-600">
            Something went wrong. Try again in a moment.
          </p>
        </div>
      ) : (
        <div className="flex flex-col w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
          <Bouncy />
        </div>
      )}
    </MaxWidthWrapper>
  )
}

export default ChatAnalysisDashboard
