import { analysisRouter } from "./analysis-router"
import { authRouter } from "./auth-router"
import { chatRouter } from "./chat-router"
import { paymentRouter } from "./payment-router"
import { shareRouter } from "./share-router"
import { router } from "./trpc"

export const appRouter = router({
  auth: authRouter,
  chat: chatRouter,
  analysis: analysisRouter,
  share: shareRouter,
  payment: paymentRouter,
})

export type AppRouter = typeof appRouter
