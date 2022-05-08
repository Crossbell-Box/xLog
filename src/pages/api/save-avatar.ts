import { NextApiHandler } from "next"
import { z } from "zod"
import { siteController } from "~/controllers/site.controller"
import { getAuthUser } from "~/lib/auth.server"
import { createGate } from "~/lib/gate.server"
import { uploadImage } from "~/lib/upload.server"

import { userModel } from "~/models/user.model"

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") return res.end("only POST")
  try {
    const user = await getAuthUser(req, true)
    const gate = createGate({ user })
    const data = await uploadImage(req, { userId: user.id })

    const values = z
      .object({
        file: z.string(),
        site: z.string().optional(),
      })
      .parse(data)

    if (values.site) {
      await siteController.updateSite(gate, {
        site: values.site,
        icon: values.file,
      })
    } else {
      await userModel.updateProfile(gate, { avatar: values.file })
    }

    res.send({ ok: true })
  } catch (error: any) {
    console.error(error)
    return res.send({
      error: error.message,
    })
  }
}

export default handler
