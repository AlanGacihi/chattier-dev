import BillingForm from "@/components/BillingForm"
import { getUserSubscriptionPlan } from "@/lemonsqueezy/actions"
import { notFound } from "next/navigation"

const Page = async () => {
  return notFound()

  const subscriptionPlan = await getUserSubscriptionPlan()

  return <BillingForm subscriptionPlan={subscriptionPlan} />
}

export default Page
