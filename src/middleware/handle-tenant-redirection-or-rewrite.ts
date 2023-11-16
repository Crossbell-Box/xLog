import { NextRequest, NextResponse } from "next/server"

import { IS_PROD } from "~/lib/constants"
import { withLocaleFactory } from "~/lib/i18n/with-locale"

export async function handleTenantRedirectionOrRewrite(
  req: NextRequest,
  options: {
    withLocale: ReturnType<typeof withLocaleFactory>
    requestHeaders: Headers
    pathname: string
    search: string
  },
) {
  const { requestHeaders, pathname = "", withLocale, search } = options

  let tenant: {
    subdomain?: string
    redirect?: string
  } = {}

  try {
    tenant = await (
      await fetch(
        new URL(
          `/api/host2handle?host=${
            req.headers.get("x-forwarded-host") || req.headers.get("host")
          }`,
          req.url,
        ),
      )
    ).json()
  } catch (error) {
    console.error(error)
  }

  if (
    tenant?.redirect &&
    IS_PROD &&
    (!pathname.startsWith(withLocale("/feed")) ||
      !pathname.startsWith(withLocale("/feed", { prefixDefault: true })))
  ) {
    return NextResponse.redirect(`${tenant.redirect}${pathname}${search}`, {
      headers: requestHeaders,
    })
  }

  requestHeaders.set("x-xlog-handle", tenant.subdomain || "")

  if (tenant?.subdomain) {
    const _pathname =
      pathname === "/" ? "" : `/${pathname.split("/").slice(-1)}`

    // We should use the full URL here, such as `/en/site/xxx`.
    // The prefix subpath(/en,/zh...) shouldn't be omitted by `prefixDefault` options.
    return NextResponse.rewrite(
      new URL(
        withLocale(`/site/${tenant?.subdomain}${_pathname}`, {
          prefixDefault: true,
        }),
        req.url,
      ),
      {
        request: {
          headers: requestHeaders,
        },
      },
    )
  }
}
