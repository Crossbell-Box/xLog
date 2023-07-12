import { Metadata } from "next"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { prefetchGetFeed } from "~/queries/home.server"

export function generateMetadata({
  params,
}: {
  params: {
    tag: string
  }
}): Metadata {
  return {
    title: `Tag: ${params.tag} - ${APP_NAME}`,
  }
}

export default async function Tag({
  params,
}: {
  params: {
    tag: string
  }
}) {
  params.tag = decodeURIComponent(params.tag)

  const queryClient = getQueryClient()
  await prefetchGetFeed(
    {
      type: "tag",
      tag: params.tag,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <h2 className="text-3xl font-bold">Tag: {params.tag}</h2>
      <HomeFeed type="tag" />
    </Hydrate>
  )
}
