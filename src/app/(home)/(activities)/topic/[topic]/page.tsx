import { Metadata } from "next"

import { HomeFeed } from "~/components/home/HomeFeed"
import { APP_NAME } from "~/lib/env"
import { getTranslation } from "~/lib/i18n"

import topics from "../../../../../../data/topics.json"

export function generateMetadata({
  params,
}: {
  params: {
    topic: string
  }
}): Metadata {
  params.topic = decodeURIComponent(params.topic)
  return {
    title: `Topic: ${params.topic} - ${APP_NAME}`,
  }
}

export default async function Topic({
  params,
}: {
  params: {
    topic: string
  }
}) {
  const { t } = await getTranslation("index")
  params.topic = decodeURIComponent(params.topic)
  const info = topics.find((t) => t.name === params.topic)

  return (
    <>
      <div className="border rounded-xl px-5 py-6 mb-4 space-y-2 relative bg-zinc-50">
        <div className="text-2xl flex items-center font-bold">
          <i className="icon-[mingcute--hashtag-fill]" />
          {info?.includeTags[0]}
        </div>
        <p className="text-zinc-600">{t(info?.description || "")}</p>
        {info?.includeKeywords?.length || 0 > 0 ? (
          <p className="text-zinc-400 text-sm">
            {t("Topic Keywords")}: {info?.includeKeywords?.join(", ")}
          </p>
        ) : null}
        {/* <Button className="absolute right-5 top-4">
          {t("Participate in Topic")}
        </Button> */}
      </div>
      <HomeFeed type="topic" noteIds={info?.notes} />
    </>
  )
}
