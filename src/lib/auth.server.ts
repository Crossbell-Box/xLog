import type { User, Membership } from "~/lib/db.server"
import { prismaRead } from "./db.server"
import dayjs from "dayjs"
import Cookie, { CookieSerializeOptions } from "cookie"
import { AUTH_COOKIE_NAME } from "./env.server"
import { IS_PROD } from "./constants"
import { IncomingMessage } from "http"
import { OUR_DOMAIN } from "./env"

export type AuthUser = User & {
  memberships: Membership[]
}

export const getAuthTokenFromRequest = (request: IncomingMessage) => {
  let token = request.headers.authorization?.replace(/[Bb]earer\s/, "")
  if (!token) {
    const cookieHeader = request.headers.cookie
    if (cookieHeader) {
      const value = Cookie.parse(cookieHeader)[AUTH_COOKIE_NAME]
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
  request: IncomingMessage,
  requireAuth?: TRequireAuth
) => {
  const token = getAuthTokenFromRequest(request)

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
  if (options.type === "clear") {
    return Cookie.serialize(
      AUTH_COOKIE_NAME,
      "",
      getAuthCookieOptions({ domain: options.domain, clearCookie: true })
    )
  }
  return Cookie.serialize(
    AUTH_COOKIE_NAME,
    options.token,
    getAuthCookieOptions({ domain: options.domain })
  )
}
