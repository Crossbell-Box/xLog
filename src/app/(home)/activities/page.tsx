import { Hydrate, dehydrate } from "@tanstack/react-query"

import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import getQueryClient from "~/lib/query-client"
import { prefetchGetFeed } from "~/queries/home.server"

async function Activities() {
  const queryClient = getQueryClient()
  await prefetchGetFeed(
    {
      type: "latest",
    },
    queryClient,
  )
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <section className="pt-24">
        <div className="max-w-screen-lg px-5 mx-auto flex">
          <div className="flex-1 min-w-[300px]">
            <HomeFeed />
          </div>
          <HomeSidebar />
        </div>
      </section>
    </Hydrate>
  )
}

export default Activities
