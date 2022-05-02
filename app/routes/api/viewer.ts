import type { ActionFunction } from "@remix-run/node"
import { z } from "zod"
import { getAuthUser } from "~/lib/auth.server"
import { userModel } from "~/models/user.model"

export const action: ActionFunction = async ({ request }) => {
  const user = await getAuthUser(request, true)
  const formData = await request.formData()

  const values = z
    .object({
      name: z.string().optional(),
      username: z.string().optional(),
      email: z.string().optional(),
      bio: z.string().optional(),
    })
    .parse(Object.fromEntries(formData))

  await userModel.updateProfile(user, {
    username: values.username,
    name: values.name,
    email: values.email,
    bio: values.bio,
  })

  return null
}
