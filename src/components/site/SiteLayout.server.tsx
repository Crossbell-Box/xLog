import { serverSideTranslations } from "next-i18next/serverSideTranslations"

import { QueryClient, dehydrate } from "@tanstack/react-query"

import { languageDetector } from "~/lib/language-detector"
import { notFound } from "~/lib/server-side-props"
import { PageVisibilityEnum } from "~/lib/types"
import { fetchGetPage, prefetchGetPagesBySite } from "~/queries/page.server"
import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
} from "~/queries/site.server"

export const getServerSideProps = async (
  ctx: any,
  queryClient: QueryClient,
  options?: {
    take?: number
    useStat?: boolean
    skipPages?: boolean
    preview?: boolean
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
      if (options?.preview) {
        // do nothing
      } else if (pageSlug) {
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
        if (!options?.skipPages) {
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
      }
      resolve(null)
    }),
  ])

  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "site",
      ])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}
