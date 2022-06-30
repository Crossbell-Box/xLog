import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { createSSGHelpers } from "@trpc/react/ssg"
import { getTRPCContext } from "~/lib/trpc.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { getViewer } from "~/lib/viewer"
import { Viewer, Profile, Notes } from "~/lib/types"
import { getSite } from "~/models/site.model"
import { getPagesBySite } from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const domainOrSubdomain = ctx.params!.site as string
  
    const [site, posts] = await Promise.all([
      getSite(domainOrSubdomain),
      getPagesBySite({
        site: domainOrSubdomain,
        take: 1000,
        type: "post",
        visibility: PageVisibilityEnum.Published,
      }),
    ])

    return {
      props: {
        site,
        posts,
        domainOrSubdomain,
      },
    }
  }
)

function SiteArchivesPage({
  site,
  posts,
}: {
  site: Profile,
  posts: Notes,
  domainOrSubdomain: string
}) {
  return (
    <SiteLayout
      site={site!}
      title="Archives"
    >
      <SiteArchives posts={posts} />
    </SiteLayout>
  )
}

export default SiteArchivesPage
