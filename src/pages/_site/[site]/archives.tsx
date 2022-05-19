import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { trpc } from "~/lib/trpc"
import { createSSGHelpers } from "@trpc/react/ssg"
import { appRouter } from "~/router"
import { getTRPCContext } from "~/lib/trpc.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"
import { getViewer } from "~/lib/viewer"
import { Viewer } from "~/lib/types"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const user = await getAuthUser(ctx.req)
    const viewer = getViewer(user)
    const domainOrSubdomain = ctx.params!.site as string

    const trpcContext = await getTRPCContext(ctx)
    const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })

    await Promise.all([
      ssg.fetchQuery("site", { site: domainOrSubdomain }),
      ssg.fetchQuery("site.pages", { site: domainOrSubdomain, take: 1000 }),
      ssg.fetchQuery("site.subscription", { site: domainOrSubdomain }),
    ])

    return {
      props: {
        viewer,
        domainOrSubdomain,
        trpcState: ssg.dehydrate(),
      },
    }
  }
)

function SiteArchivesPage({
  viewer,
  domainOrSubdomain,
}: {
  viewer: Viewer | null
  domainOrSubdomain: string
}) {
  const siteResult = trpc.useQuery(["site", { site: domainOrSubdomain }], {})
  const subscriptionResult = trpc.useQuery([
    "site.subscription",
    { site: domainOrSubdomain },
  ])
  const postsResult = trpc.useQuery([
    "site.pages",
    { site: domainOrSubdomain, take: 1000 },
  ])

  const site = siteResult.data
  const subscription = subscriptionResult.data
  const posts = postsResult.data?.nodes

  return (
    <SiteLayout
      site={site!}
      title="Archives"
      viewer={viewer}
      subscription={subscription}
    >
      <SiteArchives posts={posts} />
    </SiteLayout>
  )
}

export default SiteArchivesPage
