import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { createSSGHelpers } from "@trpc/react/ssg"
import { getTRPCContext } from "~/lib/trpc.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { getViewer } from "~/lib/viewer"
import { Viewer, Profile, Note } from "~/lib/types"
import { queryClient, prefetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { fetchGetPage } from "~/queries/page.server"
import { useGetPage } from "~/queries/page"
import { PageVisibilityEnum } from "~/lib/types"
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

    if (new Date(page.date_published) > new Date()) {
      throw notFound()
    }

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
    render: true,
    includeAuthors: true,
  })
  const ogDescription = page.data?.summary?.content || page.data?.body?.content

  const site = useGetSite(domainOrSubdomain)

  return (
    <SiteLayout
      site={site.data}
      title={page.data?.title}
      ogDescription={ogDescription}
    >
      <SitePage site={site.data} page={page.data} />
    </SiteLayout>
  )
}

export default SitePagePage
