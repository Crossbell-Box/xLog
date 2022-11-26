import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    await getLayoutServerSideProps(ctx, queryClient, {
      useStat: true,
    })

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        domainOrSubdomain,
        pageSlug,
      },
    }
  },
)

function SitePagePage({
  domainOrSubdomain,
  pageSlug,
}: {
  domainOrSubdomain: string
  pageSlug: string
}) {
  const page = useGetPage({
    site: domainOrSubdomain,
    page: pageSlug,
    useStat: true,
  })
  const site = useGetSite(domainOrSubdomain)

  return <SitePage page={page.data} site={site.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout useStat={true}>{page}</SiteLayout>
}

export default SitePagePage
