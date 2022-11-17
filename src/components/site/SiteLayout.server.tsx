import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
} from "~/queries/site.server"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { fetchGetPage } from "~/queries/page.server"
import { notFound } from "~/lib/server-side-props"

export const getServerSideProps = async (
  ctx: any,
  queryClient: QueryClient,
  options?: {
    take?: number
  },
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
    prefetchGetSiteToSubscriptions(
      {
        siteId: domainOrSubdomain,
      },
      queryClient,
    ),
    new Promise(async (resolve, reject) => {
      if (pageSlug) {
        try {
          const page = await fetchGetPage(
            {
              site: domainOrSubdomain,
              page: pageSlug,
            },
            queryClient,
          )

          if (!page || new Date(page!.date_published) > new Date()) {
            reject(notFound())
          }
        } catch (error) {
          reject(error)
        }
      } else {
        await prefetchGetPagesBySite(
          {
            site: domainOrSubdomain,
            ...(options?.take && { take: options.take }),
            type: "post",
            visibility: PageVisibilityEnum.Published,
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
