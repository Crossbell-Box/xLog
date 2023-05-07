import { notFound } from "next/navigation"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { Style } from "~/components/common/Style"
import { BackToTopFAB } from "~/components/site/BackToTopFAB"
import { SiteFooter } from "~/components/site/SiteFooter"
import { SiteHeader } from "~/components/site/SiteHeader"
import { FABContainer } from "~/components/ui/FAB"
import getQueryClient from "~/lib/query-client"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { fetchGetPage } from "~/queries/page.server"
import {
  fetchGetSite,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
} from "~/queries/site.server"

export default async function SiteLayout({
  children,
  params,
}: {
  children?: React.ReactNode
  params: {
    site: string
    slug?: string
    tag?: string
  }
}) {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  let page
  if (site?.characterId) {
    const result = await Promise.all([
      prefetchGetSiteSubscriptions(
        {
          characterId: site.characterId,
        },
        queryClient,
      ),
      prefetchGetSiteToSubscriptions(
        {
          characterId: site.characterId,
        },
        queryClient,
      ),
      new Promise<ExpandedNote | null>(async (resolve, reject) => {
        if (params.slug) {
          try {
            const page = await fetchGetPage(
              {
                characterId: site.characterId,
                slug: params.slug,
                useStat: true,
              },
              queryClient,
            )

            if (
              !page ||
              new Date(page!.metadata?.content?.date_published || "") >
                new Date()
            ) {
              reject(notFound())
            } else {
              resolve(page)
            }
          } catch (error) {
            reject(error)
          }
        } else {
          // if (!options?.skipPages) {
          //   await prefetchGetPagesBySite(
          //     {
          //       characterId: site.characterId,
          //       ...(options?.limit && { limit: options.limit }),
          //       type: "post",
          //       visibility: PageVisibilityEnum.Published,
          //       ...(params.tag && { tags: [params.tag] }),
          //       ...(options?.useStat && {
          //         useStat: true,
          //       }),
          //     },
          //     queryClient,
          //   )
          // }
          resolve(null)
        }
      }),
    ])
    page = result[2]
  } else {
    notFound()
  }

  const dehydratedState = dehydrate(queryClient)

  return (
    <Hydrate state={dehydratedState}>
      <div
        className={
          cn()
          // TODO
          // {
          //   "xlog-user": true,
          //   "xlog-user-login": isConnected,
          //   "xlog-user-site-owner": userRole?.data === "owner",
          //   "xlog-user-site-operator": userRole?.data === "operator",
          //   "xlog-user-site-follower": subscription?.data,
          //   "xlog-user-post-liker": isLiked,
          //   "xlog-user-post-minter": isMint?.data?.count,
          // },
          // `xlog-page-${type}`,
        }
      >
        {/* <SEOHead
          title={title || tag || page.data?.metadata?.content?.title || ""}
          siteName={site.data?.metadata?.content?.name || ""}
          description={
            page.data?.metadata?.content?.summary ??
            site.data?.metadata?.content?.bio?.replace(/<[^>]*>/g, "")
          }
          image={
            page.data?.metadata?.content?.cover ||
            getUserContentsUrl(site.data?.metadata?.content?.avatars?.[0])
          }
          icon={getUserContentsUrl(site.data?.metadata?.content?.avatars?.[0])}
          site={domainOrSubdomain}
        /> */}
        <Style content={site?.metadata?.content?.css} />
        {site && <SiteHeader site={site} />}
        <div
          className={cn(
            "max-w-screen-md mx-auto px-5 pt-12 relative",
            page && `xlog-post-id-${page.characterId}-${page.noteId}`,
            page?.metadata?.content?.tags?.map((tag) => `xlog-post-tag-${tag}`),
          )}
        >
          {children}
        </div>
        {site && (
          <div className="max-w-screen-md mx-auto pt-12 pb-10">
            <BlockchainInfo site={site} page={page || undefined} />
          </div>
        )}
        <SiteFooter site={site || undefined} />

        <FABContainer>
          <BackToTopFAB />
        </FABContainer>
      </div>
    </Hydrate>
  )
}
