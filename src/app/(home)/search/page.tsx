import { Hydrate, dehydrate } from "@tanstack/react-query"

import { SearchInput } from "~/components/common/SearchInput"
import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import getQueryClient from "~/lib/query-client"
import { prefetchGetShowcase } from "~/queries/home.server"

async function Search() {
  const queryClient = getQueryClient()
  await prefetchGetShowcase(queryClient)
  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <section className="pt-24">
        <div className="max-w-screen-lg px-5 mx-auto flex">
          <div className="flex-1 min-w-[300px]">
            <SearchInput />
            <div className="mt-10">
              <HomeFeed type="search" />
            </div>
          </div>
          <HomeSidebar hideSearch={true} />
        </div>
      </section>
    </Hydrate>
  )
}

export default Search
