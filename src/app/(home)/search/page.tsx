import { SearchInput } from "~/components/common/SearchInput"
import { HomeFeed } from "~/components/home/HomeFeed"
import { HomeSidebar } from "~/components/home/HomeSidebar"

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
