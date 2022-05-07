import {
  type ActionFunction,
  unstable_parseMultipartFormData,
  type UploadHandler,
} from "@remix-run/node"
import { nanoid } from "nanoid"
import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { s3uploadFile } from "~/lib/s3.server"
import { userModel } from "~/models/user.model"

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await getAuthUser(request, true)

    const uploadHandler: UploadHandler = async ({ stream }) => {
      const chunks = []
      for await (let chunk of stream) {
        chunks.push(chunk)
      }
      const buffer = Buffer.concat(chunks)
      const filename = `${user.id}/${nanoid()}.jpg`
      await s3uploadFile(filename, buffer, "image/jpeg")
      return filename
    }
    const formData = await unstable_parseMultipartFormData(
      request,
      uploadHandler
    )

    const values = z
      .object({
        file: z.string(),
        site: z.string().optional(),
      })
      .parse(Object.fromEntries(formData))

    if (values.site) {
      await siteController.updateSite(user, {
        site: values.site,
        icon: values.file,
      })
    } else {
      await userModel.updateProfile(user, { avatar: values.file })
    }

    return { ok: true }
  } catch (error: any) {
    console.error(error)
    return {
      error: error.message,
    }
  }
}
