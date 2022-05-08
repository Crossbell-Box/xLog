import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { trpc } from "~/lib/trpc"
import { createSSGHelpers } from "@trpc/react/ssg"
import { appRouter } from "~/router"
import { getTRPCContext } from "~/lib/trpc.server"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { SiteArchives } from "~/components/site/SiteArchives"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const user = await getAuthUser(ctx.req)
    const isLoggedIn = !!user
    const domainOrSubdomain = ctx.params!.site as string

    const trpcContext = await getTRPCContext(ctx)
    const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })

    await Promise.all([
      ssg.fetchQuery("site", { site: domainOrSubdomain }),
      ssg.fetchQuery("site.pages", { site: domainOrSubdomain, take: 1000 }),
    ])

    return {
      props: {
        isLoggedIn,
        domainOrSubdomain,
        trpcState: ssg.dehydrate(),
      },
    }
  }
)

function SiteArchivesPage({
  isLoggedIn,
  domainOrSubdomain,
}: {
  isLoggedIn: boolean
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
      isLoggedIn={isLoggedIn}
      subscription={subscription}
    >
      <SiteArchives posts={posts} />
    </SiteLayout>
  )
}

export default SiteArchivesPage
