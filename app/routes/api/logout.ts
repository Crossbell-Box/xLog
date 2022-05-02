import { LoaderFunction, redirect } from "@remix-run/node"
import { generateCookie } from "~/lib/auth.server"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const next = url.searchParams.get("next")
  const redirectUrl = next ? new URL(next) : new URL(url)
  if (!next) {
    redirectUrl.pathname = "/"
  }
  return redirect(redirectUrl.href, {
    headers: {
      "set-cookie": await generateCookie({ type: "clear" }),
    },
  })
}
