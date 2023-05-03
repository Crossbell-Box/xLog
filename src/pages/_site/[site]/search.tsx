import { GetServerSideProps } from "next"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import type { ReactElement } from "react"

import { QueryClient } from "@tanstack/react-query"

import { SearchInput } from "~/components/common/SearchInput"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { SiteSearch } from "~/components/site/SiteSearch"
import { useGetSearchPagesBySite } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const domainOrSubdomain = ctx.params!.site as string
  const { props: layoutProps } = await getLayoutServerSideProps(
    ctx,
    queryClient,
    {
      skipPages: true,
    },
  )

  return {
    props: {
      ...layoutProps,
      domainOrSubdomain,
    },
  }
}

function SiteSearchPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const site = useGetSite(domainOrSubdomain)
  const router = useRouter()
  const keyword = router.query.q as string
  const { t } = useTranslation(["common"])

  const posts = useGetSearchPagesBySite({
    characterId: site.data?.characterId,
    keyword,
  })

  return (
    <>
      <div className="sm:-mx-5">
        <SearchInput value={keyword} />
      </div>
      <h2 className="mb-8 mt-5 text-zinc-500">
        {posts.data?.pages?.[0].count || "0"} {t("results")}
      </h2>
      {posts.isLoading ? (
        <>{t("Loading")}...</>
      ) : (
        <SiteSearch
          postPages={posts.data?.pages}
          fetchNextPage={posts.fetchNextPage}
          hasNextPage={posts.hasNextPage}
          isFetchingNextPage={posts.isFetchingNextPage}
          keyword={keyword}
        />
      )}
    </>
  )
}

SiteSearchPage.getLayout = (page: ReactElement) => {
  return (
    <SiteLayout useStat={true} type="index">
      {page}
    </SiteLayout>
  )
}

export default SiteSearchPage
