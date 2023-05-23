import { Metadata } from "next"

import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import { APP_NAME } from "~/lib/env"

import topics from "../../../../../data/topics.json"

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

function Topic({
  params,
}: {
  params: {
    topic: string
  }
}) {
  params.topic = decodeURIComponent(params.topic)
  const info = topics.find((t) => t.name === params.topic)

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-4xl font-bold mb-4">Topic: {params.topic}</h2>
          <p className="text-zinc-400 mb-6">{info?.description}</p>
          <HomeFeed type="topic" noteIds={info?.notes} />
        </div>
        <HomeSidebar />
      </div>
    </section>
  )
}

export default Topic
