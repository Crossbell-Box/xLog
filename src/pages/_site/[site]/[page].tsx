import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { queryClientServer } from "~/lib/query-client.server"
import { prefetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchGetPage } from "~/queries/page.server"
import { useGetPage } from "~/queries/page"
import { notFound } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    await prefetchGetSite(domainOrSubdomain)
    const page = await fetchGetPage({
      site: domainOrSubdomain,
      page: pageSlug,
      render: true,
      includeAuthors: true,
    })

    if (new Date(page!.date_published) > new Date()) {
      throw notFound()
    }

    return {
      props: {
        dehydratedState: dehydrate(queryClientServer),
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
    render: true,
    includeAuthors: true,
  })
  const ogDescription = page.data?.summary?.content || page.data?.body?.content

  const site = useGetSite(domainOrSubdomain)

  return (
    <SiteLayout site={site.data} ogDescription={ogDescription} page={page.data}>
      <SitePage site={site.data} page={page.data} />
    </SiteLayout>
  )
}

export default SitePagePage
