import { PLANS } from "@/lemonsqueezy/constants"
import { absoluteUrl } from "@/lib/utils"
import { createCheckout, getCustomer } from "@lemonsqueezy/lemonsqueezy.js"
import { TRPCError } from "@trpc/server"
import { privateProcedure, router } from "./trpc"
import { configureLemonSqueezy } from "@/lemonsqueezy/config"

export const paymentRouter = router({
  createLemonSqueezyCheckout: privateProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx

    if (!user) throw new TRPCError({ code: "UNAUTHORIZED" })

    const billingUrl = absoluteUrl("/dashboard/billing")

    configureLemonSqueezy()

    if (user.lemonSqueezyCustomerId) {
      const customer = await getCustomer(user.lemonSqueezyCustomerId)

      if (customer) {
        return { url: customer.data?.data.attributes.urls.customer_portal }
      }
    }

    const variantId = parseInt(
      PLANS.find((plan) => plan.name === "Pro")?.variantId!,
      10
    )

    const checkout = await createCheckout(
      process.env.LEMONSQUEEZY_STORE_ID!,
      variantId,
      {
        checkoutOptions: {
          embed: true,
          media: true,
          logo: true,
        },
        checkoutData: {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          custom: {
            user_id: user.uid,
          },
        },
        productOptions: {
          enabledVariants: [variantId],
          redirectUrl: billingUrl,
          receiptButtonText: "Go to Dashboard",
          receiptThankYouNote: "Thank you for signing up to Lemon Stand!",
        },
      }
    )

    return { url: checkout.data?.data.attributes.url }
  }),
})
