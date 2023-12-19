import { getLocale } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import ParticipateButton from "~/components/home/ParticipateButton"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetFeed } from "~/queries/home.server"

export const generateMetadata = withHrefLang<{
  params: {
    tag: string
  }
}>(async ({ params }) => ({
  title: `Tag: ${params.tag} - ${APP_NAME}`,
}))

export default async function Tag({
  params,
}: {
  params: {
    tag: string
  }
}) {
  params.tag = decodeURIComponent(params.tag)

  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "tag",
      tag: params.tag,
      translateTo: locale,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <div className="border rounded-xl px-5 py-6 mb-4 space-y-2 relative bg-zinc-50">
        <div className="text-2xl flex items-center font-bold">
          <i className="i-mingcute-tag-line mr-1" />
          {params.tag}
        </div>
        <ParticipateButton tag={params.tag} />
      </div>
      <HomeFeed type="tag" />
    </Hydrate>
  )
}
