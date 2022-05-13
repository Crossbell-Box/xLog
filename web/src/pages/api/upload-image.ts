import { NextApiHandler } from "next"
import { z } from "zod"
import { getAuthUser } from "~/lib/auth.server"
import { uploadImage } from "~/lib/upload.server"

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") return res.end("only POST")
  try {
    const user = await getAuthUser(req, true)
    const data = await uploadImage(req, { userId: user.id })

    const values = z
      .object({
        file: z.string(),
      })
      .parse(data)

    res.send({ file: values.file })
  } catch (error: any) {
    console.error(error)
    res.send({
      error: error.message,
    })
  }
}

export default handler
