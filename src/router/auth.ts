import dayjs from "dayjs"
import { z } from "zod"
import { IS_PROD } from "~/lib/constants"
import { prisma } from "~/lib/db.server"
import { OUR_DOMAIN } from "~/lib/env"
import { sendLoginEmail } from "~/lib/mailgun.server"
import { createRouter } from "~/lib/trpc.server"

export const authRouter = createRouter()
  .query("viewer", {
    output: z
      .object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
        username: z.string(),
        avatar: z.string().nullish(),
        bio: z.string().nullish(),
      })
      .nullable(),
    async resolve({ ctx }) {
      return ctx.user || null
    },
  })
  .mutation("requestLoginLink", {
    input: z.object({
      email: z.string(),
      url: z.string(),
    }),
    output: z.boolean(),
    async resolve({ input }) {
      const token = await prisma.loginToken.create({
        data: {
          email: input.email,
          expiresAt: dayjs().add(10, "minute").toDate(),
        },
      })

      const { protocol, host, pathname } = new URL(input.url)

      const url = `${
        IS_PROD ? "https" : "http"
      }://${OUR_DOMAIN}/api/login?${new URLSearchParams([
        ["token", token.id],
        ["next", `${protocol}//${host}${pathname}`],
      ]).toString()}`

      await sendLoginEmail(url, input.email).catch(console.error)

      return true
    },
  })
