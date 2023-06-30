import { Metadata } from "next"

import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import { APP_NAME } from "~/lib/env"

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

export default function Tag({
  params,
}: {
  params: {
    tag: string
  }
}) {
  params.tag = decodeURIComponent(params.tag)

  return (
    <>
      <div className="flex-1 min-w-[300px]">
        <h2 className="text-3xl font-bold">Tag: {params.tag}</h2>
        <HomeFeed type="tag" />
      </div>
      <HomeSidebar />
    </>
  )
}
