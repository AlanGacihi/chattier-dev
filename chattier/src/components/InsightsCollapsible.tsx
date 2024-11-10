"use client"

import MyBadge from "@/components/MyBadge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PERSONALITIES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { CaretSortIcon } from "@radix-ui/react-icons"
import { Badge, Divider, ProgressBar } from "@tremor/react"
import { ChevronsRight, HelpCircle, TriangleAlert } from "lucide-react"
import { useState } from "react"
import { ProgressCircle } from "./ui/ProgressCircle"

/**
 * Props for the `InsightsCollapsible` component.
 *
 * @interface InsightsCollapsibleProps
 * @property {"PENDING" | "COMPLETE" | "ERROR"} status - The current status of the insights, which can be "PENDING", "COMPLETE", or "ERROR".
 * @property {Object} insights - An object containing various confidence metrics and their percentage changes.
 * @property {number} insights.sarcasmConfidence - The confidence level for sarcasm.
 * @property {number} insights.sarcasmConfidencePercentageChange - The percentage change in sarcasm confidence.
 * @property {number} insights.conversationInitiationRate - The rate of conversation initiation.
 * @property {number} insights.conversationInitiationRatePercentageChange - The percentage change in conversation initiation rate.
 * @property {number} insights.humorConfidence - The confidence level for humor.
 * @property {number} insights.humorConfidencePercentageChange - The percentage change in humor confidence.
 * @property {number} insights.financeConfidence - The confidence level for finance-related content.
 * @property {number} insights.financeConfidencePercentageChange - The percentage change in finance confidence.
 * @property {number} insights.profanityConfidence - The confidence level for profanity detection.
 * @property {number} insights.profanityConfidencePercentageChange - The percentage change in profanity confidence.
 * @property {number} insights.romanticConfidence - The confidence level for romantic content.
 * @property {number} insights.romanticConfidencePercentageChange - The percentage change in romantic confidence.
 * @property {number} insights.politicsConfidence - The confidence level for political content.
 * @property {number} insights.politicsConfidencePercentageChange - The percentage change in political confidence.
 * @property {number} insights.toxicConfidence - The confidence level for toxic content.
 * @property {number} insights.toxicConfidencePercentageChange - The percentage change in toxic confidence.
 * @property {number} insights.drugsConfidence - The confidence level for drug-related content.
 * @property {number} insights.drugsConfidencePercentageChange - The percentage change in drug-related content confidence.
 */
interface InsightsCollapsibleProps {
  status: "PENDING" | "COMPLETE" | "ERROR"
  progress: number
  insights: {
    sarcasmConfidence: number
    sarcasmConfidencePercentageChange: number
    conversationInitiationRate: number
    conversationInitiationRatePercentageChange: number
    engagementScore: number
    engagementScorePercentageChange: number
    humorConfidence: number
    humorConfidencePercentageChange: number
    financeConfidence: number
    financeConfidencePercentageChange: number
    profanityConfidence: number
    profanityConfidencePercentageChange: number
    romanticConfidence: number
    romanticConfidencePercentageChange: number
    politicsConfidence: number
    politicsConfidencePercentageChange: number
    toxicConfidence: number
    toxicConfidencePercentageChange: number
    drugsConfidence: number
    drugsConfidencePercentageChange: number
    personality: string
    previousPersonality: string
  }
}

/**
 * A component that displays insights in a collapsible format based on the provided status and insights data.
 *
 * @param {InsightsCollapsibleProps} props - The component props.
 * @param {"PENDING" | "COMPLETE" | "ERROR"} props.status - The current status of the insights.
 * @param {Object} props.insights - The insights data to be displayed.
 *
 * @returns {JSX.Element} The rendered collapsible insights component.
 */
const InsightsCollapsible = ({
  status,
  progress,
  insights,
}: InsightsCollapsibleProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="flex flex-col mb-3">
        <div className="flex items-center gap-x-8 justify-between py-2 ">
          <p className="text-lg text-gray-800 dark:text-gray-900 font-semibold">
            Insights
          </p>

          {status === "COMPLETE" ? (
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 px-4 py-0"
              >
                <CaretSortIcon className="h-4 w-4" />
                <span className="sr-only">Toggle</span>
              </Button>
            </CollapsibleTrigger>
          ) : status === "PENDING" ? (
            <ProgressCircle
              value={parseInt(Number(progress * 100).toFixed(0))}
              variant="success"
              strokeWidth={4}
              radius={16}
            >
              <span className="text-[0.525rem] text-gray-900 dark:text-gray-50">
                {(progress * 100).toFixed(0)}%
              </span>
            </ProgressCircle>
          ) : (
            <div className="flex items-center gap-x-3">
              <TriangleAlert className="size-6 text-red-500" />
              <p className="text-xs text-gray-500">
                Something went wrong. Please try again.
              </p>
            </div>
          )}
        </div>
        <Divider className="m-0 mb-2"></Divider>
      </div>
      <div className={cn("grid grid-cols-1 gap-y-6")}>
        {/* Conversation Initiation Rate */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-3.5": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">
                Conversation Initiation
              </p>
              <MyBadge
                value={insights.conversationInitiationRatePercentageChange}
              />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.conversationInitiationRate * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.conversationInitiationRate * 100} />
        </div>

        {/* Engagement Score */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-3.5": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">
                Engagement
              </p>
              <MyBadge value={insights.engagementScorePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.engagementScore * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.engagementScore * 100} />
        </div>

        {/* Sarcasm */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-3.5": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Sarcasm</p>
              <MyBadge value={insights.sarcasmConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.sarcasmConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.sarcasmConfidence * 100} />
        </div>

        {/* Humor */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-3.5": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Humor</p>
              <MyBadge value={insights.humorConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.humorConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.humorConfidence * 100} />
        </div>

        {/* Finance */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-4": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Finance</p>
              <MyBadge value={insights.financeConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.financeConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.financeConfidence * 100} />
        </div>

        {/* Profane */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-4": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Profanity</p>
              <MyBadge value={insights.profanityConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.profanityConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.profanityConfidence * 100} />
        </div>

        {/* Romance */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-4": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Romance</p>
              <MyBadge value={insights.romanticConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.romanticConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.romanticConfidence * 100} />
        </div>

        {/* Politics */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-4": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Politics</p>
              <MyBadge value={insights.politicsConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.politicsConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.politicsConfidence * 100} />
        </div>

        {/* Drugs */}
        <div
          className={cn("grid grid-cols-1 gap-y-2", {
            "gap-y-4": !isOpen,
          })}
        >
          <div className="flex justify-between">
            <div className="flex items-center space-x-4">
              <p className="text-base text-gray-600 font-semibold">Drugs</p>
              <MyBadge value={insights.drugsConfidencePercentageChange} />
            </div>
            <p className="text-base text-gray-500">
              <span className="font-semibold">
                {(insights.drugsConfidence * 100).toFixed(0)}
              </span>
              %
            </p>
          </div>
          <ProgressBar value={insights.drugsConfidence * 100} />
        </div>

        <CollapsibleContent>
          {/* Toxic */}
          <div className="grid grid-cols-1 gap-y-2">
            <div className="flex justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-base text-gray-600 font-semibold">Toxic</p>
                <MyBadge value={insights.toxicConfidencePercentageChange} />
              </div>
              <p className="text-base text-gray-500">
                <span className="font-semibold">
                  {(insights.toxicConfidence * 100).toFixed(0)}
                </span>
                %
              </p>
            </div>
            <ProgressBar value={insights.toxicConfidence * 100} />
          </div>
        </CollapsibleContent>

        {/* Personality */}
        <div className="grid grid-cols-1 gap-y-2">
          <TooltipProvider>
            <div className="flex items-center space-x-1">
              <p className="text-base text-gray-600 font-semibold">
                Personality
              </p>
              <Tooltip delayDuration={300}>
                <TooltipTrigger className="cursor-default ml-1.5">
                  <HelpCircle className="h-4 w-4 text-zinc-500" />
                </TooltipTrigger>
                <TooltipContent className="w-80 p-2">
                  <p className="text-sm text-gray-600">
                    Personalities are based on the Myers-Briggs Type Indicator
                    (MBTI), which assesses preferences in four dimensions:
                    Extraversion/Introversion, Sensing/Intuition,
                    Thinking/Feeling, and Judging/Perceiving. These combinations
                    result in 16 distinct personality types, each with unique
                    traits and tendencies.
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {insights.previousPersonality === "None" ||
          insights.previousPersonality === insights.personality ? (
            <Badge size="lg">{insights.personality}</Badge>
          ) : (
            <div className="flex items-center space-x-2">
              <Badge size="lg" color="gray">
                {insights.previousPersonality}
              </Badge>
              <ChevronsRight className="h-4 w-4 text-gray-500" />
              <Badge size="lg">{insights.personality}</Badge>
            </div>
          )}

          <div className="h-8">
            <p className="text-sm text-gray-500">
              {
                PERSONALITIES.find(
                  (personality) => personality.name === insights.personality
                )?.description!
              }
            </p>
          </div>
        </div>
      </div>
    </Collapsible>
  )
}

export default InsightsCollapsible
