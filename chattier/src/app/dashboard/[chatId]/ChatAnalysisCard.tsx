"use client"

import MyBadge from "@/components/MyBadge"
import ShareButton from "@/components/ShareButton"
import Pie from "@/components/icons/Pie"
import LineSpinner from "@/components/ldrs/LineSpinner"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatAnalysis } from "@/types/types"
import { formatDateWithOrdinal, formatDuration } from "@/lib/utils"
import { format } from "date-fns"
import { CheckCircle, MoreVertical, Plus, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, useState } from "react"
import DeleteChatAnalysis from "./DeleteChatAnalysis"
import { ProgressCircle } from "@/components/ui/ProgressCircle"

/**
 * A React component that renders a card for a chat analysis.
 *
 * @param {AnalysisCardProps} props - The component props.
 * @param {string} props.userId - The user ID.
 * @param {string} props.chatId - The chat ID.
 * @param {ChatAnalysis} props.chatAnalysis - The chat analysis data.
 * @returns {JSX.Element} The rendered chat analysis card component.
 */
const AnalysisCard = forwardRef<
  HTMLDivElement,
  {
    userId: string
    chatId: string
    chatAnalysis: ChatAnalysis
  }
>(({ userId, chatId, chatAnalysis }, ref) => {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const closeDropdown = () => setIsOpen(false)

  return (
    <div
      ref={ref}
      className="col-span-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg"
    >
      <div className="flex flex-row items-center justify-between py-4">
        <Link href={`/dashboard/${chatId}/analysis/${chatAnalysis.id}`}>
          <div className="px-4 sm:px-6 flex w-full items-center gap-x-4 sm:gap-x-6">
            <Pie height={40} width={40} />
            <h3 className="text-base sm:text-lg font-medium text-zinc-800 pt-1 break-words">{`${formatDateWithOrdinal(
              chatAnalysis.startDate
            )} - ${formatDateWithOrdinal(chatAnalysis.endDate)}`}</h3>
          </div>
        </Link>
        <div className="pr-1.5 sm:pr-3.5">
          <DropdownMenu
            open={isOpen}
            onOpenChange={(v) => {
              if (!v) {
                setIsOpen(v)
              }
            }}
          >
            <DropdownMenuTrigger onClick={() => setIsOpen(true)} asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-w-48">
              <DropdownMenuLabel className="text-gray-700">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <button
                  onClick={() =>
                    router.push(
                      `/dashboard/${chatId}/analysis/${chatAnalysis.id}`
                    )
                  }
                  className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200"
                >
                  View
                </button>
              </DropdownMenuItem>

              {chatAnalysis.status !== "ERROR" ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <ShareButton
                      chatId={chatId}
                      analysisId={chatAnalysis.id}
                      isOnDropdown={true}
                    />
                  </DropdownMenuItem>
                </>
              ) : null}

              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <DeleteChatAnalysis
                  chatId={chatId}
                  analysisId={chatAnalysis.id}
                  startDate={chatAnalysis.startDate}
                  endDate={chatAnalysis.endDate}
                  onActionComplete={closeDropdown}
                />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div>
        <Link href={`/dashboard/${chatId}/analysis/${chatAnalysis.id}`}>
          <div className="px-4 sm:px-6 pt-5 flex flex-col items-center justify-between text-sm font-medium text-zinc-600 gap-y-4">
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-x-2">
                <p>Total Participants</p>
                <MyBadge
                  value={chatAnalysis.totalParticipantsPercentageChange}
                />
              </div>
              <p>{chatAnalysis.totalPartcipants}</p>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-x-2">
                <p>Duration</p>
                <MyBadge value={chatAnalysis.durationPercentageChange} />
              </div>
              <p>{formatDuration(chatAnalysis.duration)}</p>
            </div>
            <div className="w-full flex items-center justify-between">
              <div className="flex gap-x-2">
                <p>Total Words</p>
                <MyBadge value={chatAnalysis.totalWordsPercentageChange} />
              </div>
              <p>{chatAnalysis.totalWords}</p>
            </div>
            <div className="w-full flex items-center justify-between">
              <p>Status</p>
              {chatAnalysis.status === "PENDING" ? (
                <ProgressCircle
                  value={parseInt(
                    Number(chatAnalysis.progress * 100).toFixed(0)
                  )}
                  variant="success"
                  strokeWidth={2}
                  radius={12}
                ></ProgressCircle>
              ) : chatAnalysis.status === "COMPLETE" ? (
                <CheckCircle className="size-4 text-green-500" />
              ) : (
                <XCircle className="size-4 text-red-500" />
              )}
            </div>
          </div>
        </Link>
      </div>

      <div className="flex items-center mt-6 px-4 sm:px-6 py-4 gap-2 justify-between text-xs font-medium text-zinc-500">
        <Plus className="h-5 w-5" />
        {format(chatAnalysis.createdAt, "MMMM d, yyyy")}
      </div>
    </div>
  )
})

AnalysisCard.displayName = "AnalysisCard"

export default AnalysisCard
