import type { User, Membership } from "@prisma/client"
import { AUTH_COOKIE_NAME } from "./config.server"
import { prismaRead } from "./db.server"
import dayjs from "dayjs"
import { type CookieSerializeOptions, createCookie } from "@remix-run/node"
import { IS_PROD, OUR_DOMAIN } from "./config.shared"

export type AuthUser = User & {
  memberships: Membership[]
}

export const getAuthTokenFromRequest = async (request: Request) => {
  let token = request.headers.get("authorization")?.replace(/[Bb]earer\s/, "")
  if (!token) {
    const cookie = createCookie(AUTH_COOKIE_NAME)
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const value = await cookie.parse(cookieHeader)
      token = value
    }
  }
  return token
}

const findUserFromToken = async (token: string) => {
  const accessToken = await prismaRead.accessToken.findUnique({
    where: {
      token,
    },
    include: {
      user: {
        include: {
          memberships: true,
        },
      },
    },
  })
  return accessToken?.user
}

export const getAuthUser = async <TRequireAuth extends boolean | undefined>(
  request: Request,
  requireAuth?: TRequireAuth
) => {
  const token = await getAuthTokenFromRequest(request)

  let user: AuthUser | null | undefined = null

  if (token) {
    user = await findUserFromToken(token)
  }

  if (!user && requireAuth) {
    throw new Error("require auth")
  }

  return user as TRequireAuth extends true
    ? AuthUser
    : AuthUser | null | undefined
}

export const getAuthCookieOptions = ({
  domain,
  clearCookie,
}: {
  domain?: string
  clearCookie?: boolean
}): CookieSerializeOptions => {
  return {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    expires: clearCookie ? new Date() : dayjs().add(6, "month").toDate(),
    secure: IS_PROD,
    domain: IS_PROD ? `.${domain || OUR_DOMAIN}` : undefined,
  }
}

export const generateCookie = (
  options:
    | { type: "clear"; domain?: string }
    | { type: "auth"; token: string; domain?: string }
) => {
  const cookie = createCookie(AUTH_COOKIE_NAME)

  if (options.type === "clear") {
    return cookie.serialize(
      "",
      getAuthCookieOptions({ domain: options.domain, clearCookie: true })
    )
  }
  return cookie.serialize(
    options.token,
    getAuthCookieOptions({ domain: options.domain })
  )
}
