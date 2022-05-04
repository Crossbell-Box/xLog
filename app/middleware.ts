import { MiddlewareResponse } from "./middleware-utils"

export default (req: Request) => {
  const url = new URL(req.url)

  const cookieHeader = req.headers.get("cookie") || ""
  if (
    url.pathname.startsWith("/dashboard") &&
    !cookieHeader.includes(process.env.AUTH_COOKIE_NAME)
  ) {
    return MiddlewareResponse.redirect("/")
  }

  if (url.pathname === "/__test_middleware") {
    return new Response("home")
  }

  return MiddlewareResponse.next()
}
