import { redirect } from "next/navigation"

import { getSiteLink } from "~/lib/helpers"

export default async function PostPage(props: {
  params: Promise<{
    site: string
    slug: string
  }>
}) {
  const params = await props.params
  redirect(
    `${getSiteLink({
      subdomain: params.site,
    })}/${params.slug}`,
  )
}
