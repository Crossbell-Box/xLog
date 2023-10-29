import { redirect } from "next/navigation"
import { NextServerPageBaseParams } from "types/next"

import { getSiteLink } from "~/lib/helpers"
import { withLocale } from "~/lib/i18n/with-locale"

export default async function PostPage({
  params,
}: NextServerPageBaseParams<{
  site: string
  slug: string
}>) {
  redirect(
    `${getSiteLink({
      subdomain: params.site,
    })}${withLocale(`/${params.slug}`, { pathLocale: params.locale })}`,
  )
}
