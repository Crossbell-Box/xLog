import { getLocale } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import ShortPreviewList from "~/components/site/ShortPreviewList"
import { APP_NAME, APP_SLOGAN } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { getPreviewShort, prefetchGetFeed } from "~/queries/home.server"

export const generateMetadata = withHrefLang(async () => ({
  title: `${APP_NAME} - ${APP_SLOGAN}`,
}))

export default async function HomeActivities() {
  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "featured",
      translateTo: locale,
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
