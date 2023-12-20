import { getLocale } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { SearchInput } from "~/components/common/SearchInput"
import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetFeed } from "~/queries/home.server"

export const generateMetadata = withHrefLang(async ({ searchParams }) => ({
  title: `Search: ${searchParams?.q} - ${APP_NAME}`,
}))

export default async function Search({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | undefined
  }
}) {
  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "search",
      searchKeyword: searchParams.q || undefined,
      searchType: "latest",
      translateTo: locale,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <SearchInput />
      <div className="mt-10">
        <HomeFeed type="search" />
      </div>
    </Hydrate>
  )
}

export const dynamic = "force-dynamic"
