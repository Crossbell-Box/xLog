import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { queryClientServer } from "~/lib/query-client.server"
import { dehydrate } from "@tanstack/react-query"
import { useGetPagesBySite } from "~/queries/page"
import { PageVisibilityEnum } from "~/lib/types"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const domainOrSubdomain = ctx.params!.site as string
  await getLayoutServerSideProps(ctx)

  return {
    props: {
      dehydratedState: dehydrate(queryClientServer),
      domainOrSubdomain,
    },
  }
}

function SiteIndexPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const posts = useGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    render: true,
  })

  return <SiteHome posts={posts.data} />
}

SiteIndexPage.getLayout = (page: ReactElement) => {
  return <SiteLayout>{page}</SiteLayout>
}

export default SiteIndexPage
