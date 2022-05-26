import { NextApiHandler } from "next"
import { z } from "zod"
import { generateCookie } from "~/lib/auth.server"
import { IS_PROD } from "~/lib/constants"
import { prismaPrimary } from "~/lib/db.server"
import { OUR_DOMAIN } from "~/lib/env"

const pathAndSearch = (pathname: string, search: string) => {
  return `${pathname}${search ? `?${search}` : ""}`
}

const handler: NextApiHandler = async (req, res) => {
  const data = z
    .object({
      id: z.string(),
      pathname: z.string().default("/"),
      search: z.string().default(""),
      host: z.string(),
    })
    .parse({
      id: req.query.id,
      pathname: req.query.pathname,
      search: req.query.search,
      host: req.headers.host,
    })

  const isCustomDomain = data.host && !data.host.endsWith(`.${OUR_DOMAIN}`)

  // Set cookie again for custom domain and subdomain.localhost (because *.localhost in cookie domain doesn't work)
  if (isCustomDomain || !IS_PROD) {
    const accessToken = await prismaPrimary.accessToken.findUnique({
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

    await prismaPrimary.accessToken.update({
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
      }),
    )
    res.redirect(pathAndSearch(data.pathname, data.search))
    return
  }

  res.redirect(pathAndSearch(data.pathname, data.search))
}

export default handler
