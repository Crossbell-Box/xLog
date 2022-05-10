import * as trpc from "@trpc/server"
import { z } from "zod"
import { isNotFoundError } from "~/lib/server-side-props"
import { TRPCContext } from "~/lib/trpc.server"
import { getSite } from "~/models/site.model"
import { authRouter } from "./auth"
import { dashboardRouter } from "./dashboard"
import { siteRouter } from "./site"
import { userRouter } from "./user"

export const appRouter = trpc
  .router<TRPCContext>()
  .query("site", {
    input: z.object({
      site: z.string(),
    }),
    output: z.object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      icon: z.string().nullable(),
      subdomain: z.string(),
    }),
    async resolve({ input }) {
      const site = await getSite(input.site)
      return site
    },
  })
  .merge("auth.", authRouter)
  .merge("dashbaord.", dashboardRouter)
  .merge("site.", siteRouter)
  .merge("user.", userRouter)
  .formatError(({ error, shape }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        notFound: isNotFoundError(error.cause),
      },
    }
  })

// export type definition of API
export type AppRouter = typeof appRouter
