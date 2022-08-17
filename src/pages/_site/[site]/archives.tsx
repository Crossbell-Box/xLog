import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { Viewer, Profile, Notes } from "~/lib/types"
import { queryClientServer } from "~/lib/query-client.server"
import { prefetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { useGetPagesBySite } from "~/queries/page"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string

    await prefetchGetSite(domainOrSubdomain)
    await prefetchGetPagesBySite({
      site: domainOrSubdomain,
      take: 1000,
      type: "post",
      visibility: PageVisibilityEnum.Published,
    })

    return {
      props: {
        dehydratedState: dehydrate(queryClientServer),
        domainOrSubdomain,
      },
    }
  },
)

function SiteArchivesPage({
  domainOrSubdomain,
}: {
  site: Profile
  posts: Notes
  domainOrSubdomain: string
}) {
  const site = useGetSite(domainOrSubdomain)
  const posts = useGetPagesBySite({
    site: domainOrSubdomain,
    take: 1000,
    type: "post",
    visibility: PageVisibilityEnum.Published,
  })

  return (
    <SiteLayout site={site.data} title="Archives">
      <SiteArchives posts={posts.data} />
    </SiteLayout>
  )
}

export default SiteArchivesPage
