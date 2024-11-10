"use client"

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
import { Label } from "@/components/ui/label"

import { trpc } from "@/app/_trpc/client"
import TailChase from "@/components/ldrs/TailChase"
import { toast } from "sonner"
import { SearchSelect, SearchSelectItem } from "@tremor/react"
import { XCircle } from "lucide-react"
import { useState } from "react"
import { usePostHog } from "posthog-js/react"

interface SyncChatPartcipantProps {
  chatId: string
  analysisId: string
  participantId: string
  aiMismatch: boolean
  prevAnalysisId?: string
  onActionComplete: () => void
}

const SyncChatPartcipant = ({
  chatId,
  analysisId,
  participantId,
  aiMismatch,
  prevAnalysisId,
  onActionComplete,
}: SyncChatPartcipantProps): JSX.Element => {
  const [isSyncronizing, setIsSynchronizing] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [targetPartcipantId, setCorrectChatPartcipantId] = useState<string>("")
  const [loadingText, setLoadingText] = useState<string>(
    "Fetching participants..."
  )
  const [error, setError] = useState<Error | null>(null)

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { data, isLoading, isError } =
    trpc.analysis.getSynchronizeChatPartcipantData.useQuery({
      chatId,
      analysisId,
      participantId,
      aiMismatch,
      prevAnalysisId,
    })

  const { mutate: synchronizeParticipant } =
    trpc.analysis.synchronizeChatPartcipantData.useMutation({
      onSuccess: async () => {
        utils.analysis.getUserChatAnalysis.invalidate()
        onActionComplete()
        setIsSynchronizing(false)
        setIsOpen(false)
        toast.success("Chat participant synchronized successfully.")
      },
      onMutate: () => {
        setIsSynchronizing(true)
        setLoadingText("Syncing...")
      },
      onError: (err) => {
        setIsSynchronizing(false)
        setError(new Error("Something went wrong."))
      },
    })

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <button className="px-2 py-1.5 rounded-md text-left text-gray-900 text-sm w-full hover:bg-gray-200">
          Sync participant
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isLoading || isSyncronizing ? (
          <div className="flex items-center justify-center h-48 space-x-4">
            <TailChase />
            <p className="text-gray-800">{loadingText}</p>
          </div>
        ) : error || isError ? (
          <div className="flex items-center justify-center h-48 space-x-4">
            <XCircle className="h-10 w-10 text-red-400" />
            <p>Something went wrong. Try again in a moment.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-800">
                Synchronize Participant
              </DialogTitle>
              <DialogDescription>
                Click sync when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-8 pt-4 pb-8">
              <div className="grid grid-cols-1 gap-y-2">
                <Label
                  htmlFor="participant"
                  className="text-base text-gray-700"
                >
                  Select participant
                </Label>

                <SearchSelect
                  placeholder="Search name..."
                  onValueChange={(value) => setCorrectChatPartcipantId(value)}
                >
                  {data!.map((participant) => (
                    <SearchSelectItem
                      key={participant.id}
                      value={participant.id}
                    >
                      {participant.name === participant.defaultName
                        ? participant.defaultName
                        : `${participant.name} (${participant.defaultName}}`}
                    </SearchSelectItem>
                  ))}
                </SearchSelect>
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  isSyncronizing ||
                  !targetPartcipantId ||
                  targetPartcipantId.length == 0
                }
                className="w-full"
                onClick={() => {
                  synchronizeParticipant({
                    chatId,
                    analysisId,
                    participantId,
                    targetPartcipantId,
                    aiMismatch,
                  })
                  posthog.capture("Synchronize Chat Participant", {
                    aiMismatch,
                  })
                }}
              >
                Sync
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default SyncChatPartcipant
