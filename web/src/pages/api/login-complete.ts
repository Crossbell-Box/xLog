import { NextApiHandler } from "next"
import { z } from "zod"
import { generateCookie } from "~/lib/auth.server"
import { IS_PROD } from "~/lib/constants"
import { prisma } from "~/lib/db.server"
import { OUR_DOMAIN } from "~/lib/env"

const handler: NextApiHandler = async (req, res) => {
  const data = z
    .object({
      id: z.string(),
      path: z.string().default("/"),
      host: z.string(),
    })
    .parse({
      id: req.query.id,
      path: req.query.path,
      host: req.headers.host,
    })

  const isCustomDomain = data.host && !data.host.endsWith(`.${OUR_DOMAIN}`)

  // Set cookie again for custom domain and subdomain.localhost (because *.localhost in cookie domain doesn't work)
  if (isCustomDomain || !IS_PROD) {
    const accessToken = await prisma.accessToken.findUnique({
      where: {
        publicId: data.id,
      },
    })

    if (
      !accessToken ||
      !accessToken.publicIdExpiresAt ||
      accessToken.publicIdExpiresAt < new Date()
    ) {
      throw new Error("invalid id or id expired")
    }

    await prisma.accessToken.update({
      where: {
        id: accessToken.id,
      },
      data: {
        publicId: null,
        publicIdExpiresAt: null,
      },
    })

    res.setHeader(
      "set-cookie",
      generateCookie({
        type: "auth",
        domain: data.host,
        token: accessToken.token,
      })
    )
    res.redirect(data.path)
    return
  }

  res.redirect(data.path)
}

export default handler
