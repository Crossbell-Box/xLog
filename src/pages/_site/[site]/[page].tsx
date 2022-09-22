import { GetServerSideProps } from "next"
import {
  SiteLayout,
  getServerSideProps as getLayoutServerSideProps,
} from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { queryClientServer } from "~/lib/query-client.server"
import { dehydrate } from "@tanstack/react-query"
import { useGetPage } from "~/queries/page"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    await getLayoutServerSideProps(ctx)

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

  return <SitePage page={page.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout>{page}</SiteLayout>
}

export default SitePagePage
