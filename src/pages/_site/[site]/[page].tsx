import { GetServerSideProps } from "next"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getAuthUser } from "~/lib/auth.server"
import { trpc } from "~/lib/trpc"
import { createSSGHelpers } from "@trpc/react/ssg"
import { appRouter } from "~/router"
import { getTRPCContext } from "~/lib/trpc.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const user = await getAuthUser(ctx.req)
    const isLoggedIn = !!user
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    const trpcContext = await getTRPCContext(ctx)
    const ssg = createSSGHelpers({ router: appRouter, ctx: trpcContext })

    await Promise.all([
      ssg.fetchQuery("site", { site: domainOrSubdomain }),
      ssg.fetchQuery("site.page", {
        site: domainOrSubdomain,
        page: pageSlug,
        renderContent: true,
      }),
    ])

    return {
      props: {
        isLoggedIn,
        domainOrSubdomain,
        pageSlug,
        trpcState: ssg.dehydrate(),
      },
    }
  }
)

function SitePagePage({
  isLoggedIn,
  domainOrSubdomain,
  pageSlug,
}: {
  isLoggedIn: boolean
  domainOrSubdomain: string
  pageSlug: string
}) {
  const siteResult = trpc.useQuery(["site", { site: domainOrSubdomain }], {})
  const subscriptionResult = trpc.useQuery([
    "site.subscription",
    { site: domainOrSubdomain },
  ])
  const pageResult = trpc.useQuery([
    "site.page",
    { site: domainOrSubdomain, page: pageSlug, renderContent: true },
  ])

  const site = siteResult.data
  const subscription = subscriptionResult.data
  const page = pageResult.data!

  return (
    <SiteLayout
      site={site!}
      title={page.title}
      isLoggedIn={isLoggedIn}
      subscription={subscription}
    >
      <SitePage page={page} />
    </SiteLayout>
  )
}

export default SitePagePage
