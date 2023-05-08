import { Metadata } from "next"

import { SearchInput } from "~/components/common/SearchInput"
import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"
import { APP_NAME } from "~/lib/env"

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

async function Search() {
  return (
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
  )
}

export default Search
