import { z } from "zod"
import { prismaPrimary } from "~/lib/db.server"
import { nanoid } from "nanoid"
import UAParser from "ua-parser-js"
import dayjs from "dayjs"
import { generateCookie } from "~/lib/auth.server"
import { OUR_DOMAIN } from "~/lib/env"
import { IS_PROD } from "~/lib/constants"
import { NextApiHandler } from "next"
import { getSite, subscribeToSite } from "~/models/site.model"
import { createGate } from "~/lib/gate.server"
import { decryptLoginToken } from "~/lib/token.server"
import { getSiteLink } from "~/lib/helpers"

const handler: NextApiHandler = async (req, res) => {
  const data = z
    .object({
      token: z.string(),
      next: z.string(),
      userAgent: z.string(),
    })
    .parse({
      token: req.query.token,
      next: req.query.next,
      userAgent: req.headers["user-agent"],
    })

  const payload = await decryptLoginToken(data.token)

  let user = await prismaPrimary.user.findUnique({
    where:
      payload.type === "unsubscribe"
        ? {
            id: payload.userId,
          }
        : {
            email: payload.email,
          },
    include: {
      memberships: true,
    },
  })

  if (!user) {
    if (payload.type === "unsubscribe") {
      throw new Error("User not found")
    } else {
      user = await prismaPrimary.user.create({
        data: {
          email: payload.email,
          name: payload.email.split("@")[0],
          username: nanoid(7),
        },
        include: {
          memberships: true,
        },
      })
    }
  }

  if (payload.type === "subscribe") {
    // Subscribe the user to the site
    const gate = createGate({ user })
    await subscribeToSite(gate, {
      siteId: payload.siteId,
      email: true,
    })
  }

  const ua = new UAParser(data.userAgent)

  const publicId = nanoid(32)
  const accessToken = await prismaPrimary.accessToken.create({
    data: {
      user: {
        connect: {
          id: user.id,
        },
      },
      token: nanoid(32),
      name: `Login via ${ua.getOS().name} ${ua.getBrowser().name}`,
      publicId,
      publicIdExpiresAt: dayjs().add(1, "minute").toDate(),
    },
  })

  if (!IS_PROD) {
    console.log("login with token", accessToken.token)
  }

  if (payload.type === "unsubscribe") {
    const site = await getSite(payload.siteId)
    data.next = `${getSiteLink({
      subdomain: site.subdomain,
    })}?subscription`
  }

  const nextUrl = new URL(data.next)

  // Custom domain
  if (nextUrl.host !== OUR_DOMAIN && !nextUrl.host.endsWith(`.${OUR_DOMAIN}`)) {
    // Check if the host belong to a site
    // const existing = await prismaPrimary.domain.findUnique({
    //   where: {
    //     domain: nextUrl.hostname,
    //   },
    // })
    // if (!existing) {
    //   throw new Error("invalid next url")
    // }
    throw new Error("invalid next url")
  }

  nextUrl.searchParams.set("id", publicId)
  nextUrl.searchParams.set("pathname", nextUrl.pathname)
  nextUrl.pathname = "/api/login-complete"
  console.log("redirecting to", nextUrl.href)

  res.setHeader(
    "set-cookie",
    generateCookie({
      type: "auth",
      domain: OUR_DOMAIN,
      token: accessToken.token,
    }),
  )

  res.redirect(nextUrl.href)
}

export default handler
