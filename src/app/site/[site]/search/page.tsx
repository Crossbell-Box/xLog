import { Metadata } from "next"

import { SearchInput } from "~/components/common/SearchInput"
import { SiteSearch } from "~/components/site/SiteSearch"
import getQueryClient from "~/lib/query-client"
import { fetchGetSite } from "~/queries/site.server"

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: {
    site: string
  }
  searchParams: {
    [key: string]: string | string[] | undefined
  }
}): Promise<Metadata> {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title = `Search: ${searchParams.q} - ${
    site?.metadata?.content?.name || site?.handle
  }`

  return {
    title,
  }
}

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
