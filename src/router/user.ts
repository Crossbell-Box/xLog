import { encrypt, getDerivedKey } from "@proselog/jwt"
import { z } from "zod"
import { IS_PROD } from "~/lib/constants"
import { ENCRYPT_SECRET } from "~/lib/env.server"
import { createRouter } from "~/lib/trpc.server"
import { userModel } from "~/models/user.model"

export const userRouter = createRouter()
  .query("getSignedJwt", {
    output: z.string(),
    async resolve({ ctx }) {
      const user = ctx.gate.getUser(true)
      const key = await getDerivedKey(ENCRYPT_SECRET)
      const token = await encrypt(
        { prefix: IS_PROD ? `${user.id}/` : `dev/${user.id}/` },
        key,
        {
          expiresIn: "1h",
        }
      )
      return token
    },
  })
  .mutation("updateProfile", {
    input: z.object({
      username: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      await userModel.updateProfile(ctx.gate, input)
    },
  })
