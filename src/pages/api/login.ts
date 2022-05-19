import { z } from "zod"
import { prismaPrimary } from "~/lib/db.server"
import { nanoid } from "nanoid"
import UAParser from "ua-parser-js"
import dayjs from "dayjs"
import { generateCookie } from "~/lib/auth.server"
import { OUR_DOMAIN } from "~/lib/env"
import { IS_PROD } from "~/lib/constants"
import { NextApiHandler } from "next"
import { subscribeToSite } from "~/models/site.model"
import { createGate } from "~/lib/gate.server"

const handler: NextApiHandler = async (req, res) => {
  const data = z
    .object({
      token: z.string(),
      next: z.string(),
      userAgent: z.string(),
      subscribe: z
        .object({
          siteId: z.string(),
          email: z.boolean().optional(),
        })
        .optional(),
    })
    .parse({
      token: req.query.token,
      next: req.query.next,
      userAgent: req.headers["user-agent"],
      subscribe:
        req.query.subscribe && JSON.parse(req.query.subscribe as string),
    })

  const loginToken = await prismaPrimary.loginToken.findUnique({
    where: {
      id: data.token,
    },
  })

  if (!loginToken) {
    throw new Error("invalid token")
  }

  if (loginToken.expiresAt < new Date()) {
    throw new Error(`token expired`)
  }

  let user = await prismaPrimary.user.findUnique({
    where: {
      email: loginToken.email,
    },
    include: {
      memberships: true,
    },
  })

  if (!user) {
    user = await prismaPrimary.user.create({
      data: {
        email: loginToken.email,
        name: loginToken.email.split("@")[0],
        username: nanoid(7),
      },
      include: {
        memberships: true,
      },
    })
  }

  if (data.subscribe) {
    // Subscribe the user to the site
    const gate = createGate({ user })
    await subscribeToSite(gate, {
      siteId: data.subscribe.siteId,
      email: data.subscribe.email,
    })
  }

  await prismaPrimary.loginToken.delete({
    where: {
      id: loginToken.id,
    },
  })

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

  // Custom domain
  const nextUrl = new URL(data.next)

  if (nextUrl.host !== OUR_DOMAIN && !nextUrl.host.endsWith(`.${OUR_DOMAIN}`)) {
    // Check if the host belong to a site
    const existing = await prismaPrimary.domain.findUnique({
      where: {
        domain: nextUrl.hostname,
      },
    })
    if (!existing) {
      throw new Error("invalid next url")
    }
  }

  nextUrl.searchParams.set("id", publicId)
  nextUrl.searchParams.set("path", nextUrl.pathname)
  nextUrl.pathname = "/api/login-complete"
  console.log("redirecting to", nextUrl.href)

  res.setHeader(
    "set-cookie",
    generateCookie({
      type: "auth",
      domain: OUR_DOMAIN,
      token: accessToken.token,
    })
  )

  res.redirect(nextUrl.href)
}

export default handler
