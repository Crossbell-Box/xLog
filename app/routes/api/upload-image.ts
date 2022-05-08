import { type ActionFunction } from "@remix-run/node"
import { z } from "zod"
import { getAuthUser } from "~/lib/auth.server"
import { uploadImage } from "~/lib/upload.server"

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await getAuthUser(request, true)
    const data = await uploadImage(request, { userId: user.id })

    const values = z
      .object({
        file: z.string(),
      })
      .parse(data)

    return { file: values.file }
  } catch (error: any) {
    console.error(error)
    return {
      error: error.message,
    }
  }
}
