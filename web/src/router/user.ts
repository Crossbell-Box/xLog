import { z } from "zod"
import { createRouter } from "~/lib/trpc.server"
import { userModel } from "~/models/user.model"

export const userRouter = createRouter().mutation("updateProfile", {
  input: z.object({
    username: z.string().optional(),
    name: z.string().optional(),
    email: z.string().optional(),
    bio: z.string().optional(),
  }),
  async resolve({ ctx, input }) {
    await userModel.updateProfile(ctx.gate, input)
  },
})
