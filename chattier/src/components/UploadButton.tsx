"use client"

import { trpc } from "@/app/_trpc/client"
import TailChase from "@/components/ldrs/TailChase"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useUploadFile } from "@/hooks/useUploadFile"
import { cn, findTxtFiles, verifyChatLog } from "@/lib/utils"
import { Badge } from "@tremor/react"
import { addDays, format, isBefore, startOfDay } from "date-fns"
import JSZip from "jszip"
import {
  BookmarkCheck,
  CloudUpload,
  HelpCircle,
  MousePointerSquareDashed,
  Plus,
  XCircle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import Dropzone, { FileRejection } from "react-dropzone"
import { toast } from "sonner"
import { Calendar } from "./ui/calendar"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { usePostHog } from "posthog-js/react"

interface UploadButtonProps {
  name: string
  userId: string
  chatId?: string
  userPublicKey: string
  minAnalysisCutoffDate?: Date
}

const UploadButton = ({
  name,
  userId,
  chatId,
  userPublicKey,
  minAnalysisCutoffDate,
}: UploadButtonProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [analysisCutoffDate, setAnalysisCutoffDate] = useState<
    Date | undefined
  >()
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(80)
  const [isPreProcessing, setIsPreProcessing] = useState<boolean>(false)

  const router = useRouter()
  const utils = trpc.useUtils()
  const posthog = usePostHog()

  const { startUpload, isUploading, isAnalyzing } = useUploadFile({
    userId,
    chatId,
    userPublicKey,
    onStatsAnalysisComplete: (data) => {
      const chatId = data.chatId
      const analysisId = data.analysisId

      startTransition(() => {
        router.push(`/dashboard/${chatId}/analysis/${analysisId}?new=true`)
      })

      utils.analysis.getUserChatAnalyses.invalidate()
      utils.chat.getUserChats.invalidate()
      utils.chat.getChatTimings.invalidate()
    },
    onUploadProgress(p) {
      setUploadProgress(p)
    },
    onError(e) {
      if (
        e.message.includes(
          "Firebase Storage: User does not have permission to access"
        )
      ) {
        toast.error(
          "You do not have permission to upload files. Please sign in again."
        )
      } else {
        toast.error(e.message)
      }

      setUploadProgress(0)
    },
  })

  const { mutate: updateAnalysisCutoff } =
    trpc.chat.updateAnalysisCutoffDate.useMutation({
      onMutate: ({ cutoffDate }) => {
        setAnalysisCutoffDate(cutoffDate ?? undefined)
      },
    })

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles

    setIsDragOver(false)

    if (!file.file.type || file.file.type === "" || file.file.type === " ") {
      toast.error(
        `Drive is not supported. Please choose from phone storage instead.`
      )
    } else {
      toast.error(
        `${file.file.type} type is not supported. Please choose a zip or txt file instead.`
      )
    }
  }

  const onDropAccepted = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) {
      setIsDragOver(false)
      return
    }

    setIsPreProcessing(true)

    let file = acceptedFiles[0]

    if (acceptedFiles.length > 1) {
      const chatTxtFile = acceptedFiles.find(
        (f) => f.name.toLowerCase().includes("chat") && f.name.endsWith(".txt")
      )

      if (!chatTxtFile) {
        toast.error(
          "The zip file does not contain a chat file. Please choose another file."
        )

        setIsDragOver(false)
        setIsPreProcessing(false)
        return
      }

      file = chatTxtFile
    }

    if (file.type === "application/zip") {
      try {
        const zip = new JSZip()
        const contents = await zip.loadAsync(file)
        const txtFiles = await findTxtFiles(contents)
        const chatTxtFile = txtFiles.find(
          (f) => f.toLowerCase().includes("chat") && f.endsWith(".txt")
        )

        if (!chatTxtFile) {
          toast.error(
            "The zip file does not contain a chat file. Please choose another file."
          )

          setIsDragOver(false)
          setIsPreProcessing(false)
          return
        }

        const txtFile = contents.file(chatTxtFile)
        if (!txtFile) {
          throw new Error(
            "Unexpected error: chat file not found after being detected"
          )
        }

        const chatText = await txtFile.async("blob")
        file = new File([chatText], "_chat.txt", { type: "text/plain" })
      } catch (error) {
        toast.error(
          "An error occurred while processing the zip file. Please try again."
        )

        setIsDragOver(false)
        setIsPreProcessing(false)
        return
      }
    }

    const { success, message } = await verifyChatLog(file)

    if (!success) {
      toast.error(message)

      setIsDragOver(false)
      setIsPreProcessing(false)
      return
    }

    setIsDragOver(false)
    setIsPreProcessing(false)

    toast.success("Preprocessing successful. Starting encryption...")

    startUpload(file)
  }

  const [isPending, startTransition] = useTransition()

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(v)
        }
      }}
    >
      <DialogTrigger
        onClick={() => {
          setIsOpen(true)
          if (name === "New Chat") {
            posthog.capture("New Chat Button Click")
          } else if (name === "New Analysis") {
            posthog.capture("New Analysis Button Click")
          }
        }}
        asChild
      >
        <Button size="sm">
          <div className="flex gap-x-2.5 items-center mr-2">
            <Plus /> <p className="text-white">{name}</p>
          </div>
        </Button>
      </DialogTrigger>

      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 gap-y-4 mt-4 mb-6">
          <div className="w-full flex justify-center items-center">
            <div className="flex gap-x-3 items-center">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="badge" asChild>
                    <Badge size="md" color="indigo">
                      <div className="flex w-40 space-x-2 items-center">
                        <BookmarkCheck className="size-4" />
                        {analysisCutoffDate ? (
                          <div className="flex w-full items-center justify-between">
                            <span>
                              {format(analysisCutoffDate, "MMM d, yyyy")}
                            </span>
                            <XCircle
                              className="size-4 ml-1 cursor-pointer text-red-500"
                              onClick={(e) => {
                                e.stopPropagation() // Prevent the popover from opening
                                updateAnalysisCutoff({
                                  chatId: chatId,
                                  cutoffDate: null,
                                })
                              }}
                            />
                          </div>
                        ) : (
                          <span>Set cutoff date</span>
                        )}
                      </div>
                    </Badge>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={analysisCutoffDate}
                    onSelect={(date) => {
                      if (date) {
                        updateAnalysisCutoff({
                          chatId: chatId,
                          cutoffDate: date,
                        })
                      }
                    }}
                    defaultMonth={
                      analysisCutoffDate
                        ? analysisCutoffDate
                        : minAnalysisCutoffDate
                        ? addDays(minAnalysisCutoffDate, 30)
                        : undefined
                    }
                    disabled={(date) => {
                      if (!minAnalysisCutoffDate) return false

                      const startDate = startOfDay(minAnalysisCutoffDate)
                      const currentDate = startOfDay(date)
                      return isBefore(currentDate, startDate)
                    }}
                  />
                </PopoverContent>
              </Popover>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                    <HelpCircle className="h-4 w-4 text-indigo-600" />
                    <span className="sr-only">Cutoff date info</span>
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-4">
                  <div className="flex flex-col space-y-2">
                    <h4 className="text-sm font-semibold">
                      Analysis Cutoff Date
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      This date sets the boundary for your next analysis. Only
                      messages up to this date will be included.
                    </p>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>

          <Dropzone
            multiple={false}
            onDropRejected={onDropRejected}
            onDropAccepted={onDropAccepted}
            accept={{
              "application/zip": [".zip"],
              "text/plain": [".txt"],
            }}
            onDragEnter={() => setIsDragOver(true)}
            onDragLeave={() => setIsDragOver(false)}
            disabled={
              isPreProcessing || isUploading || isAnalyzing || isPending
            }
          >
            {({ getRootProps, getInputProps }) => (
              <div
                className={cn(
                  "border h-64 mx-1 sm:mx-4 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer bg-gray-50",
                  {
                    " bg-gray-100": isDragOver,
                    "hover:bg-gray-100":
                      !isPreProcessing &&
                      !isUploading &&
                      isAnalyzing &&
                      !isPending,
                  }
                )}
                {...getRootProps()}
              >
                <input
                  {...getInputProps()}
                  type="file"
                  id="dropzone-file"
                  className="hidden"
                />
                {isDragOver ? (
                  <MousePointerSquareDashed className="size-8 text-zinc-500 mb-2" />
                ) : isPreProcessing ||
                  isUploading ||
                  isAnalyzing ||
                  isPending ? (
                  <div className="mb-2">
                    <TailChase />
                  </div>
                ) : (
                  <CloudUpload className="size-8 text-zinc-500 mb-2" />
                )}
                <div className="flex flex-col justify-center mb-2 text-sm text-zinc-700">
                  {isPreProcessing ? (
                    <div className="flex flex-col items-center space-y-4 mt-2">
                      <p>Preprocessing...</p>
                      <Progress
                        value={40}
                        className="mt-2 w-52 h-2 bg-gray-300"
                      />
                    </div>
                  ) : isUploading || isAnalyzing ? (
                    <div className="flex flex-col items-center space-y-4 mt-2">
                      {isUploading ? <p>Uploading...</p> : <p>Analyzing...</p>}
                      <Progress
                        value={uploadProgress}
                        className="mt-2 w-52 h-2 bg-gray-300"
                      />
                    </div>
                  ) : isPending ? (
                    <div className="flex flex-col items-center">
                      <p>Redirecting, please wait...</p>
                    </div>
                  ) : isDragOver ? (
                    <p>
                      <span className="font-semibold">Drop file</span> to upload
                    </p>
                  ) : (
                    <p>
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                  )}
                </div>

                {isPreProcessing ||
                isUploading ||
                isAnalyzing ||
                isPending ? null : (
                  <div className="flex flex-col items-center gap-12 justify-center px-8">
                    <p className="text-xs text-zinc-500">TXT, ZIP</p>
                    <p className="text-xs text-center text-zinc-500 tracking-tight">
                      When exporting your chat, choose without media for faster
                      processing.
                    </p>
                  </div>
                )}
              </div>
            )}
          </Dropzone>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadButton
