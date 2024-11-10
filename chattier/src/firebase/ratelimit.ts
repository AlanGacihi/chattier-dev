import { Timestamp } from "firebase-admin/firestore"
import { firestore } from "./admin"

interface RateLimitConfig {
  limit: number
  window: number // in seconds
}

const EXPIRES_AT = 7 * 24 * 60 * 60 * 1000 // one week in milliseconds

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  async isRateLimited(key: string): Promise<{ isRateLimited: boolean }> {
    const docRef = firestore.collection("rate-limits").doc(key)

    try {
      const result = await firestore.runTransaction(async (transaction) => {
        const doc = await transaction.get(docRef)
        const now = Date.now()
        const windowStart = now - this.config.window * 1000

        if (!doc.exists) {
          transaction.set(docRef, {
            requests: [now],
            expiresAt: Timestamp.fromDate(new Date(now + EXPIRES_AT)),
          })
          return { isRateLimited: false }
        }

        const data = doc.data() as { requests: number[]; expiresAt: Timestamp }
        const requests = data.requests.filter(
          (timestamp) => timestamp > windowStart
        )

        if (requests.length >= this.config.limit) {
          return { isRateLimited: true }
        }

        requests.push(now)
        transaction.update(docRef, {
          requests,
          expiresAt: Timestamp.fromDate(new Date(now + EXPIRES_AT)),
        })
        return { isRateLimited: false }
      })

      return result
    } catch (error) {
      console.error("Rate limiting error:", error)
      return { isRateLimited: false }
    }
  }
}

const ratelimit = new RateLimiter({ limit: 2, window: 60 })

export default ratelimit
