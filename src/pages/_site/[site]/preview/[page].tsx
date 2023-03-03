import { SiteLayout } from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { useGetPage } from "~/queries/page"
import type { ReactElement } from "react"
import { useRouter } from "next/router"
import { useGetSite } from "~/queries/site"
import { GetServerSideProps } from "next"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { QueryClient } from "@tanstack/react-query"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string

    const { props: layoutProps } = await getLayoutServerSideProps(
      ctx,
      queryClient,
      {
        preview: true,
      },
    )

    return {
      props: {
        ...layoutProps,
        domainOrSubdomain,
      },
    }
  },
)

function SitePagePage() {
  const router = useRouter()
  const domainOrSubdomain = router.query.site as string
  const pageSlug = router.query.page as string

  const page = useGetPage({
    site: domainOrSubdomain,
    pageId: pageSlug,
  })

  const site = useGetSite(domainOrSubdomain)

  return <SitePage page={page.data} site={site.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout type="post">{page}</SiteLayout>
}

export default SitePagePage
