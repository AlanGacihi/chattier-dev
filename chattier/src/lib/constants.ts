/**
 * Maximum number of participants allowed in a chat.
 * @constant {number}
 */
export const MAX_CHAT_PARTICIPANTS = 2

/**
 * Byte size limit for preprocessing data.
 * @constant {number}
 */
export const PREPROCESS_BYTES_SIZE = 10000

/**
 * Minimum number of messages required for certain operations or analyses.
 * @constant {number}
 */
export const MINIMUM_MESSAGES = 8

/**
 * Number of tokens allocated to users for free trials.
 * @constant {number}
 */
export const USER_FREE_TRIAL_TOKENS = 10_000

/**
 * Timeout duration for session expiration, in milliseconds (5 days).
 * @constant {number}
 */
export const SESSION_EXPIRATION_TIMEOUT = 60 * 60 * 24 * 5 * 1000 // 5 days

/**
 * Limit for infinite queries.
 * @constant {number}
 */
export const INFINITE_QUERY_LIMIT = 8

/**
 * Size of the batch for database operations.
 * @constant {number}
 */
export const BATCH_SIZE = 500

/**
 * Chat starter messages used in the application.
 * @constant {Set<string>}
 */
export const CHAT_STARTERS = new Set([
  "Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.",
  "Waiting for this message. This may take a while.",
])

export const PERSONALITIES = [
  {
    name: "Architect",
    description: "Innovative, strategic thinkers with a logical mindset.",
  },
  {
    name: "Logician",
    description: "Analytical problem-solvers with a thirst for knowledge.",
  },
  {
    name: "Commander",
    description: "Bold, imaginative leaders who always find a way.",
  },
  {
    name: "Debater",
    description: "Quick-thinking individuals who love intellectual challenges.",
  },
  {
    name: "Advocate",
    description:
      "Quiet idealists with a deep sense of principle and imagination.",
  },
  {
    name: "Mediator",
    description: "Poetic, kind, and altruistic individuals seeking harmony.",
  },
  {
    name: "Protagonist",
    description:
      "Charismatic and inspiring leaders, able to mesmerize their listeners.",
  },
  {
    name: "Campaigner",
    description: "Enthusiastic, creative, and sociable free spirits.",
  },
  {
    name: "Logistician",
    description:
      "Practical and fact-minded individuals, whose reliability cannot be doubted.",
  },
  {
    name: "Defender",
    description:
      "Very dedicated and warm protectors, always ready to defend their loved ones.",
  },
  {
    name: "Executive",
    description:
      "Excellent administrators, unsurpassed at managing things or people.",
  },
  {
    name: "Consul",
    description: "Extraordinarily caring, social, and popular people.",
  },
  {
    name: "Virtuoso",
    description:
      "Bold and practical experimenters, masters of all kinds of tools.",
  },
  {
    name: "Adventurer",
    description:
      "Flexible and charming artists, always ready to explore and experience something new.",
  },
  {
    name: "Entrepreneur",
    description:
      "Smart, energetic, and perceptive people who truly enjoy living on the edge.",
  },
  {
    name: "Entertainer",
    description:
      "Spontaneous, energetic, and enthusiastic people – life is never boring around them.",
  },
  {
    name: "None",
    description: "This user has no messages.",
  },
]
