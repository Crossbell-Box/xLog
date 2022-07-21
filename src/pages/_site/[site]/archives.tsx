import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { createSSGHelpers } from "@trpc/react/ssg"
import { getTRPCContext } from "~/lib/trpc.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { getViewer } from "~/lib/viewer"
import { Viewer, Profile, Notes } from "~/lib/types"
import { queryClient, prefetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getPagesBySite } from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
    
    await prefetchGetSite(domainOrSubdomain)
  
    const [posts] = await Promise.all([
      getPagesBySite({
        site: domainOrSubdomain,
        take: 1000,
        type: "post",
        visibility: PageVisibilityEnum.Published,
      }),
    ])

    return {
      props: {
        dehydratedState: dehydrate(queryClient),
        posts,
        domainOrSubdomain,
      },
    }
  }
)

function SiteArchivesPage({
  posts,
  domainOrSubdomain,
}: {
  site: Profile,
  posts: Notes,
  domainOrSubdomain: string
}) {
  const site = useGetSite(domainOrSubdomain)

  return (
    <SiteLayout
      site={site.data}
      title="Archives"
    >
      <SiteArchives posts={posts} />
    </SiteLayout>
  )
}

export default SiteArchivesPage
