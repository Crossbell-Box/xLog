import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { useGetPagesBySiteLite } from "~/queries/page"
import { PageVisibilityEnum } from "~/lib/types"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  const domainOrSubdomain = ctx.params!.site as string
  await getLayoutServerSideProps(ctx, queryClient, {
    useStat: true,
  })

  return {
    props: {
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
      domainOrSubdomain,
    },
  }
}

function SiteIndexPage({ domainOrSubdomain }: { domainOrSubdomain: string }) {
  const posts = useGetPagesBySiteLite({
    site: domainOrSubdomain,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    useStat: true,
  })

  return (
    <SiteHome
      postPages={posts.data?.pages}
      fetchNextPage={posts.fetchNextPage}
      hasNextPage={posts.hasNextPage}
      isFetchingNextPage={posts.isFetchingNextPage}
    />
  )
}

SiteIndexPage.getLayout = (page: ReactElement) => {
  return <SiteLayout useStat={true}>{page}</SiteLayout>
}

export default SiteIndexPage
