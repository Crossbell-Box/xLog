import { Metadata } from "next"

import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query"

import { SearchInput } from "~/components/common/SearchInput"
import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import { prefetchGetFeed } from "~/queries/home.server"

export function generateMetadata({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}): Metadata {
  return {
    title: `Search: ${searchParams.q} - ${APP_NAME}`,
  }
}

export default async function Search({
  searchParams,
}: {
  searchParams: {
    [key: string]: string | undefined
  }
}) {
  const queryClient = new QueryClient()
  await prefetchGetFeed(
    {
      type: "search",
      searchKeyword: searchParams.q || undefined,
      searchType: "latest",
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <HydrationBoundary state={dehydratedState}>
      <SearchInput />
      <div className="mt-10">
        <HomeFeed type="search" />
      </div>
    </HydrationBoundary>
  )
}

export const dynamic = "force-dynamic"
