import { Metadata } from "next"
import { notFound } from "next/navigation"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { Style } from "~/components/common/Style"
import { BackToTopFAB } from "~/components/site/BackToTopFAB"
import { SiteFooter } from "~/components/site/SiteFooter"
import { SiteHeader } from "~/components/site/SiteHeader"
import { FABContainer } from "~/components/ui/FAB"
import { SITE_URL } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { cn } from "~/lib/utils"
import {
  fetchGetSite,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
} from "~/queries/site.server"

export async function generateMetadata({
  params,
}: {
  params: {
    site: string
  }
}): Promise<Metadata> {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title = site?.metadata?.content?.name || site?.handle
  const description = site?.metadata?.content?.bio
  const images =
    site?.metadata?.content?.avatars || `${SITE_URL}/assets/logo.svg`
  const twitterCreator =
    "@" +
    site?.metadata?.content?.connected_accounts
      ?.find((account) => account?.endsWith?.("@twitter"))
      ?.match(/csb:\/\/account:([^@]+)@twitter/)?.[1]

  return {
    title,
    description,
    themeColor: "#ffffff", // TODO
    alternates: {
      types: {
        "application/rss+xml": [
          { url: "/feed?format=xml", title },
          { url: "/feed/comments?format=xml", title: `Comments on ${title}` },
        ],
        "application/feed+json": [
          { url: "/feed", title },
          { url: "/feed/comments", title: `Comments on ${title}` },
        ],
      },
    },
    icons: images,
    openGraph: {
      siteName: title,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
      site: "@_xLog",
      creator: twitterCreator,
    },
  }
}

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
    await Promise.all([
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
    ])
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
        <Style content={site?.metadata?.content?.css} />
        {site && <SiteHeader handle={params.site} />}
        <div
          className={cn(
            "max-w-screen-md mx-auto px-5 pt-12 relative",
            // page && `xlog-post-id-${page.characterId}-${page.noteId}`,
            // page?.metadata?.content?.tags?.map((tag) => `xlog-post-tag-${tag}`),
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
