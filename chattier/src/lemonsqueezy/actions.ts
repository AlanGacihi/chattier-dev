import "server-only"

import { getCurrentUser } from "@/auth/server"
import { PLANS } from "./constants"
import { firestore } from "@/firebase/admin"
import { Timestamp } from "firebase-admin/firestore"

export const getUserSubscriptionPlan = async () => {
  const user = await getCurrentUser()

  if (!user) {
    return {
      ...PLANS[0],
      isSubscribed: false,
      isCanceled: false,
      lemonSqueezyCurrentPeriodRenewsAt: undefined,
      lemonSqueezyPeriodEndsAt: undefined,
    }
  }

  const isSubscribed = Boolean(
    user.lemonSqueezyVariantId &&
      (!user.lemonSqueezyPeriodEndsAt ||
        user.lemonSqueezyPeriodEndsAt.getTime() + 86_400_000 > Date.now()) // 86400000 = 1 day
  )

  const plan = isSubscribed
    ? PLANS.find((plan) => plan.variantId === user.lemonSqueezyVariantId) ||
      PLANS[0]
    : PLANS[0]

  return {
    ...plan,
    lemonSqueezySubscriptionId: user.lemonSqueezySubscriptionId,
    lemonSqueezyCustomerId: user.lemonSqueezyCustomerId,
    lemonSqueezyCurrentPeriodRenewsAt: user.lemonSqueezyCurrentPeriodRenewsAt,
    lemonSqueezyPeriodEndsAt: user.lemonSqueezyPeriodEndsAt,
    isSubscribed,
    isCanceled: user.lemonSqueezyStatus === "cancelled",
  }
}

interface UpdateUserSubscriptionArgs {
  userId: string
  subscriptionId: string
  customerId: string
  variantId: string
  renewsAt: string
  endsAt: string | null
  status: string
}

export const updateUserSubscription = async ({
  userId,
  subscriptionId,
  customerId,
  variantId,
  renewsAt,
  endsAt,
  status,
}: UpdateUserSubscriptionArgs) => {
  const userDoc = firestore.collection("users").doc(userId)

  await userDoc.update({
    lemonSqueezySubscriptionId: subscriptionId,
    lemonSqueezyCustomerId: customerId,
    lemonSqueezyVariantId: variantId,
    lemonSqueezyCurrentPeriodRenewsAt: Timestamp.fromDate(new Date(renewsAt)),
    lemonSqueezyPeriodEndsAt: endsAt
      ? Timestamp.fromDate(new Date(endsAt))
      : null,
    lemonSqueezyStatus: status,
  })
}
