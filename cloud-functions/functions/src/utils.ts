import axios from "axios"
import { HttpsError, Request } from "firebase-functions/v2/https"
import * as stream from "stream"

export function triggerUnawaitedHttpsFunction(
  functionName: string,
  data: unknown
) {
  try {
    const url = `https://europe-west2-chattier-7b9f0.cloudfunctions.net/${functionName}`

    // Make the POST request
    axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_TOKEN!}`,
        "Content-Type": "application/json",
      },
    })
  } catch (error) {
    console.error("Error calling unawaited Cloud Function:", error)
    throw error
  }
}

export async function triggerAwaitedHttpsFunction(
  functionName: string,
  data: unknown
) {
  try {
    const url = `https://europe-west2-chattier-7b9f0.cloudfunctions.net/${functionName}`

    // Make the POST request
    const response = await axios.post(url, data, {
      headers: {
        Authorization: `Bearer ${process.env.ADMIN_TOKEN!}`,
        "Content-Type": "application/json",
      },
    })

    // check response
    if (response.status !== 200) {
      throw new Error("Error occurred on cloud function.")
    }
  } catch (error) {
    console.error("Error calling awaited Cloud Function:", error)
    throw error
  }
}

export function verifyAcessToken(request: Request) {
  if (
    !request.headers.authorization ||
    !request.headers.authorization.includes("Bearer ")
  ) {
    throw new HttpsError(
      "permission-denied",
      "Only admins can call this function directly."
    )
  }

  // Compare tokens
  if (request.headers.authorization !== `Bearer ${process.env.ADMIN_TOKEN!}`) {
    throw new HttpsError(
      "permission-denied",
      "Tokens do not match. Only admins can call this function directly."
    )
  }
}

/**
 * Parses a date string in the format "dd/mm/yyyy, hh:mm:ss" into a JavaScript `Date` object.
 *
 * @param {string} dateStr - The date string to parse.
 * @returns {Date} - The resulting `Date` object.
 * @example
 * const date = parseDate("15/08/2024, 13:45:30");
 * console.log(date); // Outputs: Thu Aug 15 2024 13:45:30 GMT+0000 (Coordinated Universal Time)
 */
export function parseDate(dateStr: string): Date {
  const [datePart, timePartRaw] = dateStr.split(", ")
  const [day, month, year] = datePart.split("/").map(Number)

  // Check for AM/PM in the time part
  let timePart = timePartRaw.trim()
  let isPM = timePart.includes("PM")
  let isAM = timePart.includes("AM")

  // Remove the AM/PM part from time
  timePart = timePart.replace(/[APM\s\u202F]+/g, "")

  // Split the time part by ":" and handle cases where seconds may be missing
  const timeParts = timePart.split(":").map(Number)
  let hours = timeParts[0]
  const minutes = timeParts[1]
  const seconds = timeParts[2] !== undefined ? timeParts[2] : 0 // Default to 0 if seconds are not provided

  // Adjust hours based on AM/PM
  if (isPM && hours < 12) {
    hours += 12
  } else if (isAM && hours === 12) {
    hours = 0 // Midnight case
  }

  return new Date(
    year < 100 ? 2000 + year : year,
    month - 1,
    day,
    hours,
    minutes,
    seconds
  )
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
export const calculatePercentageChange = (current: number, previous: number) =>
  previous !== 0 ? ((current - previous) / previous) * 100 : 0

// Helper function to read N bytes from a readable stream
export function readNBytes(
  readable: stream.Readable,
  n: number
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    readable.once("error", reject)
    readable.once("readable", () => {
      const chunk = readable.read(n)
      if (chunk) {
        resolve(chunk)
      } else {
        reject(new Error("Not enough data in stream"))
      }
    })
  })
}

export function formatChatLine(line: string): string {
  // Remove unwanted characters
  line = line.replace(/[\u202A\u202C\u200E]|(<This message was edited>)/g, "")

  // Convert 12-hour format to 24-hour and standardize date
  const convertedLine = line.replace(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2}),\s(\d{1,2}):(\d{2})\s(AM|PM)\s-\s([^:]+):\s(.*)/,
    (
      match: string,
      month: string,
      day: string,
      year: string,
      hour: string,
      minute: string,
      ampm: string,
      name: string,
      message: string
    ): string => {
      // Parse date
      const fullYear = parseInt(year) + (parseInt(year) < 50 ? 2000 : 1900)

      // Convert hour to 24-hour format
      let hour24 = parseInt(hour)
      if (ampm.toUpperCase() === "PM" && hour24 !== 12) hour24 += 12
      if (ampm.toUpperCase() === "AM" && hour24 === 12) hour24 = 0

      // Format the date and time
      const formattedDateTime = `[${day.padStart(2, "0")}/${month.padStart(
        2,
        "0"
      )}/${fullYear}, ${hour24.toString().padStart(2, "0")}:${minute}:00]`

      return `${formattedDateTime} ${name}: ${message}`
    }
  )

  // If the above replacement didn't match (i.e., it's already in 24-hour format),
  // just wrap the existing date-time in square brackets
  if (convertedLine === line) {
    return line.replace(
      /^(\d{2}\/\d{2}\/\d{4}),\s(\d{2}:\d{2})\s-\s([^:]+):\s(.*)/,
      "[$1, $2:00] $3: $4"
    )
  }

  return convertedLine
}
