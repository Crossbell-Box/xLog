import { redirect } from "next/navigation"

import { getSiteLink } from "~/lib/helpers"

export default async function PostPage({
  params,
}: {
  params: {
    site: string
    slug: string
  }
}) {
  redirect(
    `${getSiteLink({
      subdomain: params.site,
    })}/${params.slug}`,
  )
}
