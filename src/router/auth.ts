import { z } from "zod"
import { sendLoginEmail } from "~/lib/mailgun.server"
import { createRouter } from "~/lib/trpc.server"
import { getViewer } from "~/lib/viewer"

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
      return getViewer(ctx.user)
    },
  })
  .mutation("requestLoginLink", {
    input: z.object({
      email: z.string().nonempty("email is required"),
      url: z.string(),
    }),
    output: z.boolean(),
    async resolve({ input }) {
      await sendLoginEmail({
        url: input.url,
        email: input.email,
      }).catch(console.error)

      return true
    },
  })
