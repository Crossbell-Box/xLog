import { Metadata } from "next"
import { getLocale } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { prefetchGetFeed } from "~/queries/home.server"

export const metadata: Metadata = {
  title: `Hottest Activities - ${APP_NAME}`,
}

export default async function HottestActivities() {
  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "hottest",
      daysInterval: 7,
      translateTo: locale,
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
