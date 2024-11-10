"use client"

import { trpc } from "@/app/_trpc/client"
import TailChase from "@/components/ldrs/TailChase"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { XCircle } from "lucide-react"
import { useState } from "react"
import { usePostHog } from "posthog-js/react"

interface EditChatPartcipantProps {
  isPrimary: boolean
  chatId: string
  analysisId: string
  participantId: string
  numParticipants: number
  onActionComplete: () => void
}

const EditChatPartcipant = ({
  isPrimary,
  chatId,
  analysisId,
  participantId,
  numParticipants,
  onActionComplete,
}: EditChatPartcipantProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [newName, setNewName] = useState<string>("")
  const [error, setError] = useState<Error | null>(null)
  const [newIsPrimary, setNewIsPrimary] = useState<boolean | null>(null)

  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { mutate: saveParticipant } =
    trpc.analysis.saveChatParticipantData.useMutation({
      onSuccess: () => {
        utils.analysis.getUserChatAnalysis.invalidate()
        onActionComplete()
        setIsSaving(false)
        setIsOpen(false)
        toast.success("Details updated successfully.")
      },
      onMutate: () => {
        setIsSaving(true)
      },
      onError: (e) => {
        setError(new Error("Something went wrong. Try again"))
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
          Edit name
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {isSaving ? (
          <div className="flex items-center justify-center h-48 space-x-4">
            <TailChase />
            <p className="text-gray-800">Saving changes...</p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48 space-x-4">
            <XCircle className="h-10 w-10 text-red-400" />
            <p>Something went wrong. Try again in a moment.</p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-gray-800">
                Edit Name
              </DialogTitle>
              <DialogDescription>
                Click save when you&apos;re done.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col space-y-8 pt-4 pb-8">
              <div className="grid grid-cols-1 gap-y-2">
                <Label htmlFor="user" className="text-base text-gray-700">
                  You?
                </Label>
                <RadioGroup
                  defaultValue={isPrimary ? "yes" : "no"}
                  className="flex space-x-4"
                  onValueChange={(v) => {
                    if (v === "yes") {
                      if (isPrimary) {
                        setNewIsPrimary(null)
                      } else {
                        setNewIsPrimary(true)
                      }
                    } else {
                      if (!isPrimary) {
                        setNewIsPrimary(null)
                      } else {
                        setNewIsPrimary(false)
                      }
                    }
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="r1" />
                    <Label htmlFor="r1" className="text-gray-600">
                      Yes
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="r2" />
                    <Label htmlFor="r2" className="text-gray-600">
                      No
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-1 gap-y-2">
                <Label htmlFor="name" className="text-base text-gray-700">
                  New name
                </Label>
                <Input onChange={(e) => setNewName(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button
                disabled={
                  (newName.length === 0 && newIsPrimary === null) || isSaving
                }
                className="w-full"
                onClick={() => {
                  saveParticipant({
                    chatId,
                    analysisId,
                    participantId,
                    numParticipants,
                    data: {
                      isPrimary: newIsPrimary ?? isPrimary,
                      name: newName,
                    },
                  })
                  posthog.capture("Chat Participant Edit", {
                    newName,
                    isPrimary,
                  })
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditChatPartcipant
