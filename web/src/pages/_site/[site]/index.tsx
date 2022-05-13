import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { trpc } from "~/lib/trpc"
import { createSSGHelpers } from "@trpc/react/ssg"
import { appRouter } from "~/router"
import { getTRPCContext } from "~/lib/trpc.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getAuthUser(ctx.req)
  const isLoggedIn = !!user
  const domainOrSubdomain = ctx.params!.site as string

  const trpcContext = await getTRPCContext(ctx)
  const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })

  await Promise.all([
    ssg.fetchQuery("site", { site: domainOrSubdomain }),
    ssg.fetchQuery("site.subscription", { site: domainOrSubdomain }),
  ])

  return {
    props: {
      isLoggedIn,
      domainOrSubdomain,
      trpcState: ssg.dehydrate(),
    },
  }
}

function SiteIndexPage({
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
  const postsResult = trpc.useQuery(["site.pages", { site: domainOrSubdomain }])

  const site = siteResult.data
  const subscription = subscriptionResult.data
  const posts = postsResult.data

  return (
    <SiteLayout
      site={site!}
      isLoggedIn={isLoggedIn}
      subscription={subscription}
    >
      <SiteHome posts={posts} />
    </SiteLayout>
  )
}

export default SiteIndexPage
