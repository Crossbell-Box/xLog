import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"

import topics from "../../../../../data/topics.json"

function Topic({
  params,
}: {
  params: {
    topic: string
  }
}) {
  const info = topics.find((t) => t.name === params.topic)

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-3xl font-bold">Topic: {params.topic}</h2>
          <p className="text-zinc-400 mt-4">{info?.description}</p>
          <div className="mt-10">
            <HomeFeed type="topic" noteIds={info?.notes} />
          </div>
        </div>
        <HomeSidebar />
      </div>
    </section>
  )
}

export default Topic
