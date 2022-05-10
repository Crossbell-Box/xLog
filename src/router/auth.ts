import dayjs from "dayjs"
import { z } from "zod"
import { prisma } from "~/lib/db.server"
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

      await sendLoginEmail({
        url: input.url,
        email: input.email,
        token: token.id,
      }).catch(console.error)

      return true
    },
  })
