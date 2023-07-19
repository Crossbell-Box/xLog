import { Metadata } from "next"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { prefetchGetFeed } from "~/queries/home.server"

export const metadata: Metadata = {
  title: `Hottest Activities - ${APP_NAME}`,
}

export default async function HottestActivities() {
  const queryClient = getQueryClient()
  await prefetchGetFeed(
    {
      type: "hottest",
      daysInterval: 7,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <HomeFeed type="hottest" />
    </Hydrate>
  )
}
