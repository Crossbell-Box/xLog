import { getLocale } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetFeed } from "~/queries/home.server"

export const generateMetadata = withHrefLang(async () => ({
  title: `Shorts - ${APP_NAME}`,
}))

export default async function LatestActivities() {
  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "shorts",
      translateTo: locale,
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
