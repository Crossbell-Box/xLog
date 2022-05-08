import { z } from "zod"
import { prisma } from "~/lib/db.server"
import { nanoid } from "nanoid"
import UAParser from "ua-parser-js"
import dayjs from "dayjs"
import { generateCookie } from "~/lib/auth.server"
import { OUR_DOMAIN } from "~/lib/env"
import { IS_PROD } from "~/lib/constants"
import { NextApiHandler } from "next"

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

  const loginToken = await prisma.loginToken.findUnique({
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

  let user = await prisma.user.findUnique({
    where: {
      email: loginToken.email,
    },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: loginToken.email,
        name: loginToken.email.split("@")[0],
        username: nanoid(7),
      },
    })
  }

  await prisma.loginToken.delete({
    where: {
      id: loginToken.id,
    },
  })

  const ua = new UAParser(data.userAgent)

  const publicId = nanoid(32)
  const accessToken = await prisma.accessToken.create({
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
    const existing = await prisma.domain.findUnique({
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
