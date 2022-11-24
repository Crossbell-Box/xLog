import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
  prefetchGetUserSites,
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
    useStat?: boolean
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
              ...(options?.useStat && {
                useStat: true,
              }),
            },
            queryClient,
          )

          if (!page || new Date(page!.date_published) > new Date()) {
            reject(notFound())
          }

          // if (page?.authors[0]) {
          //   await prefetchGetUserSites(page?.authors[0], queryClient)
          // }
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
            ...(options?.useStat && {
              useStat: true,
            }),
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
