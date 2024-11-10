"use client"

import CustomBadge from "@/components/MyBadge"
import { BackgroundGradient } from "@/components/ui/background-gradient"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChatParticipant } from "@/types/types"
import { formatTime } from "@/lib/utils"
import { Badge, Divider, ProgressCircle } from "@tremor/react"
import { format } from "date-fns"
import { HelpCircle, MoreHorizontal, Star, Verified } from "lucide-react"
import { useState } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import SyncChatPartcipant from "../app/dashboard/[chatId]/analysis/[analysisId]/SyncChatParticipant"
import EditChatPartcipant from "../app/dashboard/[chatId]/analysis/[analysisId]/EditChatPartcipant"
import DeleteChatPartcipant from "../app/dashboard/[chatId]/analysis/[analysisId]/DeleteChatPartcipant"
import InsightsCollapsible from "@/components/InsightsCollapsible"

interface ChatPartcipantCardBaseProps {
  participant: ChatParticipant
  showDropDown?: boolean
}

interface ChatPartcipantCardWithDropDown extends ChatPartcipantCardBaseProps {
  showDropDown: true
  chatId: string
  analysisId: string
  status: "PENDING" | "COMPLETE" | "ERROR"
  progress: number
  numParticipants: number
}

interface ChatPartcipantCardWithoutDropDown
  extends ChatPartcipantCardBaseProps {
  showDropDown?: false
  chatId?: string
  analysisId?: string
  status?: "PENDING" | "COMPLETE" | "ERROR"
  progress?: number
  numParticipants?: number
}

type ChatPartcipantCardProps =
  | ChatPartcipantCardWithDropDown
  | ChatPartcipantCardWithoutDropDown

export const ChatPartcipantCard = ({
  participant,
  chatId,
  analysisId,
  status,
  progress,
  numParticipants,
  showDropDown = false,
}: ChatPartcipantCardProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false)

  const closeDropdown = () => setIsOpen(false)

  // Insights
  const insights = {
    sarcasmConfidence: participant.sarcasmConfidence,
    sarcasmConfidencePercentageChange:
      participant.sarcasmConfidencePercentageChange,
    conversationInitiationRate: participant.conversationInitiationRate,
    conversationInitiationRatePercentageChange:
      participant.conversationInitiationRatePercentageChange,
    engagementScore: participant.engagementScore,
    engagementScorePercentageChange:
      participant.engagementScorePercentageChange,
    humorConfidence: participant.humorConfidence,
    humorConfidencePercentageChange:
      participant.humorConfidencePercentageChange,
    financeConfidence: participant.financeConfidence,
    financeConfidencePercentageChange:
      participant.financeConfidencePercentageChange,
    profanityConfidence: participant.profanityConfidence,
    profanityConfidencePercentageChange:
      participant.profanityConfidencePercentageChange,
    romanticConfidence: participant.romanticConfidence,
    romanticConfidencePercentageChange:
      participant.romanticConfidencePercentageChange,
    politicsConfidence: participant.politicsConfidence,
    politicsConfidencePercentageChange:
      participant.politicsConfidencePercentageChange,
    toxicConfidence: participant.toxicConfidence,
    toxicConfidencePercentageChange:
      participant.toxicConfidencePercentageChange,
    drugsConfidence: participant.drugsConfidence,
    drugsConfidencePercentageChange:
      participant.drugsConfidencePercentageChange,
    personality: participant.personality,
    previousPersonality: participant.previousPersonality,
  } satisfies Partial<ChatParticipant>

  return (
    <BackgroundGradient className="rounded-[22px] p-4 sm:p-6 bg-white dark:bg-zinc-900">
      <div className="grid grid-cols-1 gap-y-2 lg:w-[360px]">
        <div className="flex items-center justify-between">
          <TooltipProvider>
            <div className="flex items-center gap-x-4">
              <div className="flex items-center gap-x-2">
                <p className="text-xl text-gray-700 dark:text-dark-tremor-content-strong font-semibold">
                  {participant.name}
                </p>

                {participant.isPrimary && (
                  <Verified className="size-4 text-green-600" />
                )}
              </div>

              {participant.isNew && (
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="cursor-default">
                    <HelpCircle className="h-4 w-4 text-zinc-600" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-2">
                    <p className="text-sm text-gray-600">
                      {participant.aiMismatch
                        ? "The AI model couldn't match the chat data to a user. Please synchronize to link with the correct chat participant."
                        : "This is a new chat participant. If this is incorrect, please synchronize to update the data."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </TooltipProvider>
          {showDropDown && (
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
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-48">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {participant.isNew ? (
                  <DropdownMenuItem asChild>
                    <SyncChatPartcipant
                      chatId={chatId!}
                      analysisId={analysisId!}
                      participantId={participant.id}
                      aiMismatch={participant.aiMismatch}
                      prevAnalysisId={participant.prevAnalysisDocRefId}
                      onActionComplete={closeDropdown}
                    />
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <EditChatPartcipant
                      isPrimary={participant.isPrimary}
                      chatId={chatId!}
                      analysisId={analysisId!}
                      participantId={participant.id}
                      numParticipants={numParticipants!}
                      onActionComplete={closeDropdown}
                    />
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <DeleteChatPartcipant
                    chatId={chatId!}
                    analysisId={analysisId!}
                    participantId={participant.id}
                    onActionComplete={closeDropdown}
                  />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Divider className="m-0 p-0"></Divider>

        {/* Chattier */}
        <div className="flex items-center gap-x-7 py-4 w-full">
          <ProgressCircle
            value={parseInt((participant.chattierConfidence * 100).toFixed(0))}
            strokeWidth={10}
            radius={50}
          >
            <span className="text-sm font-medium text-gray-900 dark:text-gray-50">
              {(participant.chattierConfidence * 100).toFixed(0)}%
            </span>
          </ProgressCircle>
          <div className="flex flex-col gap-y-2 w-full">
            <div className="flex items-center justify-between">
              <p className="text-base font-medium text-gray-900 dark:text-gray-50">
                {participant.words}/{participant.totalWords}
              </p>
              <CustomBadge value={participant.chattierPercentageChange} />
            </div>
            <p className="text-base text-gray-500 dark:text-gray-500">
              Total words in messages
            </p>
          </div>
        </div>

        {/* Insights */}
        <InsightsCollapsible
          status={status!}
          progress={progress!}
          insights={insights}
        />

        {/* Stats */}
        <div className="mt-6">
          <div className="flex flex-col gap-y-2">
            <p className="text-lg text-gray-800 dark:text-gray-900 font-semibold">
              Stats
            </p>
            <Divider className="m-0 mb-4"></Divider>
          </div>
          <div className="flex flex-col gap-y-6">
            {/* Average Response Time */}
            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <p className="text-base text-gray-600 font-semibold">
                  Average Response Time
                </p>
                <CustomBadge
                  value={participant.averageResponseTimePercentageChange}
                />
              </div>
              <Badge size="lg">
                {formatTime(participant.averageResponseTime)}
              </Badge>
            </div>

            {/* Favorite Words */}
            <div className="flex flex-col gap-y-4">
              <p className="text-base text-gray-600 font-semibold">
                Favorite Words
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {participant.favoriteWords.length > 0 ? (
                  participant.favoriteWords.map((word, i) => (
                    <Badge key={i} size="lg">
                      {word}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 h-8">
                    This participant has no messages.
                  </p>
                )}
              </div>
            </div>

            {/* Favorite Emojis */}
            <div className="flex flex-col gap-y-4">
              <p className="text-base text-gray-600 font-semibold">
                Favorite Emojis
              </p>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {participant.favoriteEmojis.length > 0 ? (
                  participant.favoriteEmojis.map((emoji, i) => (
                    <Badge key={i} size="lg">
                      {emoji}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 h-8">
                    This participant has no messages.
                  </p>
                )}
              </div>
            </div>

            {/* Blocks */}
            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <p className="text-base text-gray-600 font-semibold">Blocks</p>
                <CustomBadge value={participant.blocksPercentageChange} />
              </div>
              <div className="flex flex-wrap gap-x-2 gap-y-2">
                {participant.blocks.length > 0 ? (
                  participant.blocks.map((block, i) => (
                    <Badge key={i} size="lg">
                      {format(block.timeStamp, "PPP")}
                    </Badge>
                  ))
                ) : (
                  <Badge size="lg">None</Badge>
                )}
              </div>
            </div>

            {/* Deleted Messages */}
            <div className="flex flex-col gap-y-4">
              <div className="flex items-center gap-x-4">
                <p className="text-base text-gray-600 font-semibold">
                  Deleted Messages
                </p>
                <CustomBadge
                  value={participant.deletedMessagesPercentageChange}
                />
              </div>
              <Badge size="lg">{participant.deletedMessages}</Badge>
            </div>
          </div>
        </div>
      </div>
    </BackgroundGradient>
  )
}
