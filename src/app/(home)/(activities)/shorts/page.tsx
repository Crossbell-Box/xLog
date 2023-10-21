import { Metadata } from "next"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { prefetchGetFeed } from "~/queries/home.server"

export const metadata: Metadata = {
  title: `Shorts - ${APP_NAME}`,
}

export default async function LatestActivities() {
  const queryClient = getQueryClient()
  await prefetchGetFeed(
    {
      type: "shorts",
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <HomeFeed type="shorts" />
    </Hydrate>
  )
}
