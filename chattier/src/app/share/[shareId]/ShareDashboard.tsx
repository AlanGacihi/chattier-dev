"use client"

import { trpc } from "@/app/_trpc/client"
import MaxWidthWrapper from "@/components/MaxWidthWrapper"
import Pie from "@/components/icons/Pie"
import Bouncy from "@/components/ldrs/Bouncy"
import { Share } from "@/types/types"
import { cn } from "@/lib/utils"
import { Badge } from "@tremor/react"
import { format } from "date-fns"
import { Ghost, Users, XCircle } from "lucide-react"
import { ChatPartcipantCard } from "@/components/ChatParticipantCard"

/**
 * A React component that displays the dashboard for a given shared link.
 *
 * @param {Object} props - The component props.
 * @param {Share} props.share - The `Share` object containing the details to display in the dashboard.
 * @returns {JSX.Element} The rendered component.
 */
const ShareDashboard = ({ share }: { share: Share }): JSX.Element => {
  const {
    data: chatAnalysis,
    isLoading,
    isError,
  } = trpc.share.getChatAnalysis.useQuery({
    shareId: share.id,
  })

  return (
    <MaxWidthWrapper className="flex-1 flex flex-col">
      {chatAnalysis ? (
        <>
          <div className="flex flex-col w-full items-start sm:items-center border-b mt-8 sm:mt-12 lg:flex-row justify-between gap-y-6 pb-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-10 gap-y-6">
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
            </div>
          </div>
          {chatAnalysis.totalPartcipants > 0 ? (
            <div
              className={cn(
                "mt-12 mb-28 grid grid-cols-1 gap-y-12 w-full sm:grid-cols-2 sm:gap-x-6 lg:gap-x-8 justify-items-center",
                {
                  "lg:grid-cols-3": chatAnalysis.totalPartcipants > 2,
                }
              )}
            >
              {chatAnalysis.participants.map((participant, i) => (
                <ChatPartcipantCard
                  key={i}
                  participant={participant}
                  status="COMPLETE"
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
        <div className="flex flex-col w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
          <div className="flex justify-center items-center space-x-4">
            <XCircle className="h-10 w-10 text-red-400" />
            <p className="text-lg text-gray-600">
              Something went wrong. Try again in a moment.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full min-h-[calc(100vh-8.5rem-1px)] items-center justify-center">
          <Bouncy />
        </div>
      )}
    </MaxWidthWrapper>
  )
}

export default ShareDashboard
