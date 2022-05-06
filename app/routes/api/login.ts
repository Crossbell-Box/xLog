import { type LoaderFunction, redirect } from "@remix-run/node"
import { z } from "zod"
import { prismaRead, prismaWrite } from "~/lib/db.server"
import { nanoid } from "nanoid"
import UAParser from "ua-parser-js"
import dayjs from "dayjs"
import { IS_PROD, OUR_DOMAIN } from "~/lib/config.shared"
import { generateCookie } from "~/lib/auth.server"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const data = z
    .object({
      token: z.string(),
      next: z.string(),
      userAgent: z.string(),
    })
    .parse({
      token: url.searchParams.get("token"),
      next: url.searchParams.get("next"),
      userAgent: request.headers.get("user-agent"),
    })

  const loginToken = await prismaRead.loginToken.findUnique({
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

  let user = await prismaRead.user.findUnique({
    where: {
      email: loginToken.email,
    },
  })

  if (!user) {
    user = await prismaWrite.user.create({
      data: {
        email: loginToken.email,
        name: loginToken.email.split("@")[0],
        username: nanoid(7),
      },
    })
  }

  await prismaWrite.loginToken.delete({
    where: {
      id: loginToken.id,
    },
  })

  const ua = new UAParser(data.userAgent)

  const publicId = nanoid(32)
  const accessToken = await prismaWrite.accessToken.create({
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
  if (
    nextUrl.host !== OUR_DOMAIN &&
    !nextUrl.hostname.endsWith(`.${OUR_DOMAIN}`)
  ) {
    // Check if the host belong to a site
    const existing = await prismaRead.domain.findUnique({
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

  return redirect(nextUrl.href, {
    headers: {
      "set-cookie": await generateCookie({
        type: "auth",
        domain: OUR_DOMAIN,
        token: accessToken.token,
      }),
    },
  })
}
