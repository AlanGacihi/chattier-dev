"use client"

import { useState, useCallback } from "react"
import { ref, uploadBytesResumable } from "firebase/storage"
import { httpsCallable } from "firebase/functions"
import { functions, storage } from "@/firebase/client"
import crypto from "crypto-browserify"
import { toast } from "sonner"
import { trpc } from "@/app/_trpc/client"
import { usePostHog } from "posthog-js/react"

interface UploadOptions {
  userId: string
  chatId?: string
  userPublicKey: string
  onStatsAnalysisComplete: (data: {
    chatId: string
    analysisId: string
  }) => void
  onUploadProgress: (progress: number) => void
  onError?: (error: Error) => void
}

interface UploadHookResult {
  startUpload: (file: File) => void
  isUploading: boolean
  isAnalyzing: boolean
}

export function useUploadFile(options: UploadOptions): UploadHookResult {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const posthog = usePostHog()

  const rateMutation = trpc.auth.checkRateLimit.useMutation()

  const encryptAESKey = useCallback(
    (aesKey: Buffer): Buffer => {
      return crypto.publicEncrypt(
        {
          key: options.userPublicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
        },
        aesKey
      )
    },
    [options.userPublicKey]
  )

  const encryptFile = useCallback(
    async (file: File): Promise<ArrayBuffer> => {
      const aesKey = crypto.randomBytes(32)
      const iv = crypto.randomBytes(16)
      const encryptedAESKey = encryptAESKey(aesKey)

      const fileBuffer = await file.arrayBuffer()
      const cipher = crypto.createCipheriv("aes-256-cbc", aesKey, iv)

      const header = Buffer.alloc(8)
      header.writeUInt32BE(encryptedAESKey.length, 0)
      header.writeUInt32BE(iv.length, 4)

      const encryptedData = Buffer.concat([
        cipher.update(Buffer.from(fileBuffer)),
        cipher.final(),
      ])

      return Buffer.concat([header, encryptedAESKey, iv, encryptedData])
    },
    [encryptAESKey]
  )

  const startUpload = useCallback(
    async (file: File) => {
      setIsUploading(true)

      try {
        posthog.capture("Upload Begin")

        const encryptedFileBuffer = await encryptFile(file)

        toast.success("Encryption complete.")

        const fileAnalysisId = crypto.randomBytes(16).toString("hex")
        const storageRef = ref(
          storage,
          `/encrypted/${options.userId}/${fileAnalysisId}/_chat.encrypted`
        )

        const { isRateLimited } = await rateMutation.mutateAsync()
        if (isRateLimited) {
          posthog.capture("Rate Limit")
          options.onError?.(
            new Error(
              "You are uploading too fast. Please wait a moment and try again."
            )
          )
          setIsUploading(false)
          return
        }

        const task = uploadBytesResumable(storageRef, encryptedFileBuffer)

        task.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            options.onUploadProgress?.(80 + (progress * 20) / 100)
          },
          (error) => {
            setIsUploading(false)
            options.onError?.(error)
          },
          async () => {
            setIsUploading(false)
            setIsAnalyzing(true)

            try {
              const callable = httpsCallable(functions, "analyzeChatLog", {
                timeout: 3600000,
              })
              const result = await callable({
                chatId: options.chatId,
                fileAnalysisId,
              })
              const { chatId, analysisId } = result.data as {
                chatId: string
                analysisId: string
              }

              options.onStatsAnalysisComplete?.({ chatId, analysisId })
              setIsAnalyzing(false)
            } catch (error) {
              setIsAnalyzing(false)
              options.onError?.(
                error instanceof Error
                  ? error
                  : new Error("An error occurred during analysis.")
              )
            }
          }
        )
      } catch (error) {
        posthog.capture("Upload Error")
        setIsUploading(false)
        options.onError?.(
          error instanceof Error
            ? error
            : new Error("An error occurred during file encryption.")
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options, encryptFile]
  )

  return { startUpload, isUploading, isAnalyzing }
}
