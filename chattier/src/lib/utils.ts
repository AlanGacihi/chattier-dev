import { type ClassValue, clsx } from "clsx"
import JSZip from "jszip"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"
import {
  CHAT_STARTERS,
  MAX_CHAT_PARTICIPANTS,
  MINIMUM_MESSAGES,
  PREPROCESS_BYTES_SIZE,
} from "./constants"

/**
 * Combines class names and merges Tailwind CSS classes.
 * @param {...ClassValue[]} inputs - The class names to be combined and merged.
 * @returns {string} The combined and merged class names.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}${path}`
  return `http://localhost:${process.env.PORT ?? 3000}${path}`
}

/**
 * Calculates the percentage change between the current and previous values.
 *
 * The formula used is: \((\frac{{\text{current} - \text{previous}}}{\text{previous}}) \times 100\)
 * If the previous value is 0, the function returns 0 to avoid division by zero.
 *
 * @param {number} current - The current value.
 * @param {number} previous - The previous value.
 * @returns {number} - The percentage change from the previous value to the current value.
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number => (previous !== 0 ? ((current - previous) / previous) * 100 : 0)

/**
 * Verifies the format and content of a chat log file.
 * @param {File} file - The chat log file to be verified.
 * @returns {Promise<{ success: boolean; message?: string }>} A promise that resolves to an object indicating the success status and an optional message.
 */
export async function verifyChatLog(
  file: File
): Promise<{ success: boolean; message?: string }> {
  const chunk = await file.slice(0, PREPROCESS_BYTES_SIZE).text()
  const lines = chunk.split("\n")

  const users = new Set<string>()
  let numMessages = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const cleanedLine = line.replace(/[\u202C\u202A\u200E]/g, "")

    const appleFormatMatch = cleanedLine.match(
      /^\u200E?\[(\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2})\] ([^:]+): (.*)$/u
    )

    const androidFormatMatch = cleanedLine.match(
      /^(\d{1,2}\/\d{1,2}\/\d{2,4},\s\d{1,2}:\d{2}(?:\s(?:AM|PM))?)\s-\s([^:]+):\s(.*)$/
    )

    const match = appleFormatMatch || androidFormatMatch

    if (match) {
      const [_, __, participantName, ___] = match
      users.add(participantName)
      numMessages++
    }
  }

  if (users.size === 0 && numMessages === 0) {
    return {
      success: false,
      message:
        "The input file has an invalid format. Please upload another file.",
    }
  }

  if (numMessages < MINIMUM_MESSAGES + 1) {
    return {
      success: false,
      message: `Please upload a chat with at least ${MINIMUM_MESSAGES} messages.`,
    }
  }

  if (users.size === 0) {
    return {
      success: false,
      message: "Please upload a chat with at least one participant.",
    }
  }

  if (users.size > MAX_CHAT_PARTICIPANTS + 1) {
    return {
      success: false,
      message: `Please upload a chat with fewer particpants. Maximum allowed is ${MAX_CHAT_PARTICIPANTS}.`,
    }
  }

  return { success: true }
}

/**
 * Finds and returns the list of .txt files within a zip archive.
 * @param {JSZip} zip - The JSZip instance representing the zip archive.
 * @returns {Promise<string[]>} A promise that resolves to an array of file paths for the .txt files in the zip archive.
 */
export async function findTxtFiles(zip: JSZip): Promise<string[]> {
  const txtFiles: string[] = []

  for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
    if (!zipEntry.dir && relativePath.endsWith(".txt")) {
      txtFiles.push(relativePath)
    }
  }

  return txtFiles
}

/**
 * Formats a duration in seconds into a human-readable string.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} A formatted string representing the duration in days, hours, minutes, and seconds.
 */
export function formatTime(seconds: number): string {
  const days = Math.floor(seconds / (24 * 3600))
  seconds %= 24 * 3600
  const hours = Math.floor(seconds / 3600)
  seconds %= 3600
  const minutes = Math.floor(seconds / 60)
  seconds %= 60

  const dayStr = days > 0 ? `${days}d ` : ""
  const hourStr = hours > 0 ? `${hours}h ` : ""
  const minuteStr = minutes > 0 ? `${minutes}m ` : ""
  const secondStr = `${seconds.toFixed(0)}s`

  return `${dayStr}${hourStr}${minuteStr}${secondStr}`.trim()
}

/**
 * Formats a duration in seconds into a human-readable string using the largest time unit possible.
 * @param {number} seconds - The duration in seconds.
 * @returns {string} A formatted string representing the duration in years, months, weeks, days, hours, minutes, or seconds.
 */
export function formatDuration(seconds: number): string {
  const intervals = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.unit}${count !== 1 ? "s" : ""}`
    }
  }

  return "0 seconds"
}

/**
 * Formats a date into a string with the day of the month followed by an ordinal suffix.
 * @param {Date} date - The date to format.
 * @returns {string} A formatted string representing the date with an ordinal suffix.
 */
export function formatDateWithOrdinal(date: Date): string {
  const day = date.getDate()
  const ordinal = getOrdinal(day)
  return format(date, `MMM d'${ordinal}'`)
}

/**
 * Gets the ordinal suffix for a given day of the month.
 * @param {number} n - The day of the month.
 * @returns {string} The ordinal suffix for the given day.
 */
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return s[(v - 20) % 10] || s[v] || s[0]
}
