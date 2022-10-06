import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
} from "~/queries/site.server"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchGetPage } from "~/queries/page.server"
import { notFound } from "~/lib/server-side-props"

export const getServerSideProps = async (
  ctx: any,
  queryClient: QueryClient,
) => {
  const domainOrSubdomain = ctx.params!.site as string
  const pageSlug = ctx.params!.page as string
  const tag = ctx.params!.tag as string

  await Promise.all([
    prefetchGetSite(domainOrSubdomain, queryClient),
    prefetchGetSiteSubscriptions(
      {
        siteId: domainOrSubdomain,
      },
      queryClient,
    ),
    new Promise(async (resolve) => {
      if (pageSlug) {
        const page = await fetchGetPage(
          {
            site: domainOrSubdomain,
            page: pageSlug,
            render: true,
            includeAuthors: true,
          },
          queryClient,
        )

        if (new Date(page!.date_published) > new Date()) {
          throw notFound()
        }
      } else {
        await prefetchGetPagesBySite(
          {
            site: domainOrSubdomain,
            take: 1000,
            type: "post",
            visibility: PageVisibilityEnum.Published,
            render: true,
            ...(tag && { tags: [tag] }),
          },
          queryClient,
        )
      }
      resolve(null)
    }),
  ])

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  }
}
