import { getLocale, getTranslations } from "next-intl/server"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import ParticipateButton from "~/components/home/ParticipateButton"
import { APP_NAME } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { Language } from "~/lib/types"
import { withHrefLang } from "~/lib/with-hreflang"
import { prefetchGetFeed } from "~/queries/home.server"

import topics from "../../../../../../../data/topics.json"

export const generateMetadata = withHrefLang<{
  params: {
    topic: string
  }
}>(async ({ params }) => {
  params.topic = decodeURIComponent(params.topic)
  return {
    title: `Topic: ${params.topic} - ${APP_NAME}`,
  }
})

export default async function Topic({
  params,
}: {
  params: {
    topic: string
  }
}) {
  const t = await getTranslations()
  params.topic = decodeURIComponent(params.topic)
  const info = topics.find((t) => t.name === params.topic)

  const queryClient = getQueryClient()
  const locale = (await getLocale()) as Language
  await prefetchGetFeed(
    {
      type: "topic",
      topic: params.topic,
      translateTo: locale,
    },
    queryClient,
  )

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <div className="border rounded-xl px-5 py-6 mb-4 space-y-2 relative bg-zinc-50">
        <div className="text-2xl flex items-center font-bold">
          <i className="i-mingcute-tag-line mr-1" />
          {info?.includeTags[0]}
        </div>
        <p className="text-zinc-600">{t(info?.description || "")}</p>
        {info?.includeKeywords?.length ? (
          <p className="text-zinc-400 text-sm">
            {t("Topic Keywords")}: {info?.includeKeywords?.join(", ")}
          </p>
        ) : null}
        <ParticipateButton tag={params.topic} />
      </div>
      <HomeFeed type="topic" />
    </Hydrate>
  )
}
