import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { trpc } from "~/lib/trpc"
import { createSSGHelpers } from "@trpc/react/ssg"
import { appRouter } from "~/router"
import { getTRPCContext } from "~/lib/trpc.server"
import { Viewer } from "~/lib/types"
import { getViewer } from "~/lib/viewer"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getAuthUser(ctx.req)
  const domainOrSubdomain = ctx.params!.site as string

  const viewer = getViewer(user)
  const trpcContext = await getTRPCContext(ctx)
  const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })

  await Promise.all([
    ssg.fetchQuery("site", { site: domainOrSubdomain }),
    ssg.fetchQuery("site.pages", { site: domainOrSubdomain }),
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

function SiteIndexPage({
  viewer,
  domainOrSubdomain,
}: {
  viewer: Viewer | null
  domainOrSubdomain: string
}) {
  const { data: site } = trpc.useQuery(
    ["site", { site: domainOrSubdomain }],
    {}
  )
  const { data: subscription } = trpc.useQuery([
    "site.subscription",
    { site: domainOrSubdomain },
  ])
  const { data: posts } = trpc.useQuery([
    "site.pages",
    { site: domainOrSubdomain },
  ])

  return (
    <SiteLayout site={site!} viewer={viewer} subscription={subscription}>
      <SiteHome posts={posts} />
    </SiteLayout>
  )
}

export default SiteIndexPage
