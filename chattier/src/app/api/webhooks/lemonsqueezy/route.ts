import { updateUserSubscription } from "@/lemonsqueezy/actions"
import { webhookHasData, webhookHasMeta } from "@/lemonsqueezy/utils"
import crypto from "node:crypto"

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    })
  }

  // Get the raw body content.
  const rawBody = await request.text()

  // Get the webhook secret from the environment variables.
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  // Get the signature from the request headers.
  const signature = Buffer.from(request.headers.get("X-Signature") ?? "", "hex")

  // Create a HMAC-SHA256 hash of the raw body content using the secret and
  // compare it to the signature.
  const hmac = Buffer.from(
    crypto.createHmac("sha256", secret).update(rawBody).digest("hex"),
    "hex"
  )

  if (!crypto.timingSafeEqual(hmac, signature)) {
    return new Response("Invalid signature", { status: 400 })
  }

  const data = JSON.parse(rawBody) as unknown

  if (webhookHasMeta(data)) {
    const userId = data.meta.custom_data.user_id

    if (!userId) {
      return new Response("No user Id", {
        status: 200,
      })
    }

    if (
      data.meta.event_name === "subscription_created" ||
      data.meta.event_name === "subscription_updated" ||
      data.meta.event_name === "subscription_cancelled"
    ) {
      if (webhookHasData(data)) {
        const subscriptionId = data.data.id.toString()
        const customerId = data.data.attributes.customer_id.toString()
        const variantId = data.data.attributes.variant_id.toString()
        const renewsAt = data.data.attributes.renews_at.toString()
        const endsAt = data.data.attributes.ends_at
          ? data.data.attributes.ends_at.toString()
          : null
        const status = data.data.attributes.status.toString()

        await updateUserSubscription({
          userId,
          customerId,
          subscriptionId,
          variantId,
          renewsAt,
          endsAt,
          status,
        })

        return new Response("OK", { status: 200 })
      }
    }
  }

  return new Response("Data invalid", { status: 400 })
}
