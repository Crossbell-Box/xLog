import { Metadata } from "next"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import { prefetchGetFeed } from "~/queries/home.server"

export const metadata: Metadata = {
  title: `Hottest Activities - ${APP_NAME}`,
}

export default async function HottestActivities() {
  const queryClient = new QueryClient()
  await prefetchGetFeed(
    {
      type: "hottest",
      daysInterval: 7,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <HomeFeed type="hottest" />
    </HydrationBoundary>
  )
}
