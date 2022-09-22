import { GetServerSideProps } from "next"
import {
  SiteLayout,
  getServerSideProps as getLayoutServerSideProps,
} from "~/components/site/SiteLayout"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { Profile, Notes } from "~/lib/types"
import { queryClientServer } from "~/lib/query-client.server"
import { dehydrate } from "@tanstack/react-query"
import { useGetPagesBySite } from "~/queries/page"
import { PageVisibilityEnum } from "~/lib/types"
import type { ReactElement } from "react"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
    const tag = ctx.params!.tag as string

    await getLayoutServerSideProps(ctx)

    return {
      props: {
        dehydratedState: dehydrate(queryClientServer),
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
  const posts = useGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
    render: true,
    tags: [tag],
  })

  return <SiteArchives posts={posts.data} title={tag} />
}

SiteTagPage.getLayout = (page: ReactElement) => {
  return <SiteLayout>{page}</SiteLayout>
}

export default SiteTagPage
