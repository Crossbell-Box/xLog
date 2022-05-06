import { type LoaderFunction, redirect } from "@remix-run/node"
import { z } from "zod"
import { generateCookie } from "~/lib/auth.server"
import { IS_PROD } from "~/lib/constants"
import { prismaRead, prismaWrite } from "~/lib/db.server"
import { OUR_DOMAIN } from "~/lib/env"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const data = z
    .object({
      id: z.string(),
      path: z.string().default("/"),
      host: z.string(),
    })
    .parse({
      id: url.searchParams.get("id"),
      path: url.searchParams.get("path"),
      host: request.headers.get("host"),
    })

  const isCustomDomain = data.host && !data.host.endsWith(`.${OUR_DOMAIN}`)

  // Set cookie again for custom domain and subdomain.localhost (because *.localhost in cookie domain doesn't work)
  if (isCustomDomain || !IS_PROD) {
    const accessToken = await prismaRead.accessToken.findUnique({
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

    await prismaWrite.accessToken.update({
      where: {
        id: accessToken.id,
      },
      data: {
        publicId: null,
        publicIdExpiresAt: null,
      },
    })

    return redirect(data.path, {
      headers: {
        "set-cookie": await generateCookie({
          type: "auth",
          domain: data.host,
          token: accessToken.token,
        }),
      },
    })
  }

  return redirect(data.path)
}
