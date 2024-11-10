import { getCurrentUser } from "@/auth/server"
import { TRPCError, initTRPC } from "@trpc/server"
import superjson from "superjson"

const t = initTRPC.create({
  transformer: superjson,
})
const middleware = t.middleware

const isAuth = middleware(async (opts) => {
  const user = await getCurrentUser()

  if (!user || !user.uid) {
    throw new TRPCError({ code: "UNAUTHORIZED" })
  }

  return opts.next({
    ctx: {
      user,
    },
  })
})

export const router = t.router
export const publicProcedure = t.procedure
export const privateProcedure = t.procedure.use(isAuth)
