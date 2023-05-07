import { SearchInput } from "~/components/common/SearchInput"
import { SiteSearch } from "~/components/site/SiteSearch"

export default async function SiteSearchPage() {
  return (
    <>
      <div className="sm:-mx-5">
        <SearchInput />
      </div>
      <SiteSearch />
    </>
  )
}
