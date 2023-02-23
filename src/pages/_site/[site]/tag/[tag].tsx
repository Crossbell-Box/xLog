import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { Profile, Notes } from "~/lib/types"
import { QueryClient } from "@tanstack/react-query"
import { useGetPagesBySiteLite } from "~/queries/page"
import { PageVisibilityEnum } from "~/lib/types"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string
    const tag = ctx.params!.tag as string

    const { props: layoutProps } = await getLayoutServerSideProps(
      ctx,
      queryClient,
      {
        take: 100,
      },
    )

    return {
      props: {
        ...layoutProps,
        domainOrSubdomain,
        tag,
      },
    }
  },
)

function SiteTagPage({
  domainOrSubdomain,
  tag,
}: {
  site: Profile
  posts: Notes
  domainOrSubdomain: string
  tag: string
}) {
  const posts = useGetPagesBySiteLite({
    site: domainOrSubdomain,
    take: 100,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    tags: [tag],
  })

  return (
    <SiteArchives
      postPages={posts.data?.pages}
      fetchNextPage={posts.fetchNextPage}
      hasNextPage={posts.hasNextPage}
      isFetchingNextPage={posts.isFetchingNextPage}
      title={tag}
    />
  )
}

SiteTagPage.getLayout = (page: ReactElement) => {
  return <SiteLayout type="tag">{page}</SiteLayout>
}

export default SiteTagPage
