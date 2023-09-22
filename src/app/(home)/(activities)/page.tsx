import { Metadata } from "next"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import ShortPreviewList from "~/components/site/ShortPreviewList"
import { APP_NAME, APP_SLOGAN } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { getPreviewShort, prefetchGetFeed } from "~/queries/home.server"

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_SLOGAN}`,
}

export default async function HomeActivities() {
  const queryClient = getQueryClient()
  await prefetchGetFeed(
    {
      type: "featured",
    },
    queryClient,
  )
  const shorts = await getPreviewShort()

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <ShortPreviewList
        shorts={shorts}
        className="pb-8 mb-8 space-y-4"
        isHome={true}
      />
      <HomeFeed type="featured" />
    </Hydrate>
  )
}
