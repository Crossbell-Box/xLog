import { Metadata } from "next"
import { headers } from "next/headers"
import { notFound } from "next/navigation"

import { Hydrate, dehydrate } from "@tanstack/react-query"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import Style from "~/components/common/Style"
import { BackToTopFAB } from "~/components/site/BackToTopFAB"
import SiteFooter from "~/components/site/SiteFooter"
import { SiteHeader } from "~/components/site/SiteHeader"
import { FABContainer } from "~/components/ui/FAB"
import { SITE_URL } from "~/lib/env"
import getQueryClient from "~/lib/query-client"
import { isOnlyContent } from "~/lib/search-parser"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { fetchGetPage } from "~/queries/page.server"
import {
  fetchGetSite,
  getCharacterColors,
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

  const title =
    site?.metadata?.content?.site_name || site?.metadata?.content?.name
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

  // https://github.com/vercel/next.js/issues/46618#issuecomment-1450416633
  // Issue: The type will not be updated when the page is redirected.
  const pathname = headers().get("x-xlog-pathname")
  const onlyContent = isOnlyContent()

  let type: string
  switch (pathname) {
    case "/":
      type = "index"
      break
    case "/nft":
      type = "nft"
      break
    case "/archive":
      type = "archive"
      break
    case "/search":
      type = "search"
      break
    default:
      if (pathname?.startsWith("/tag/")) {
        type = "tag"
      } else {
        type = "post"
      }
  }

  let page: ExpandedNote | undefined | null
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
      new Promise<void>(async (resolve) => {
        if (type === "post") {
          page = await fetchGetPage(
            {
              characterId: site.characterId,
              slug: pathname?.slice(1),
              useStat: true,
            },
            queryClient,
          )
          resolve()
        } else {
          resolve()
        }
      }),
    ])
  } else {
    notFound()
  }

  const dehydratedState = dehydrate(queryClient)

  const colors = await getCharacterColors(site)

  return (
    <Hydrate state={dehydratedState}>
      <div
        className={`xlog-page xlog-page-${type} xlog-user xlog-deprecated-class`}
      >
        <Style content={site?.metadata?.content?.css} />
        {colors?.light.averageColor && (
          <style>
            {`.light {
              --auto-hover-color: ${colors.light.autoHoverColor};
              --auto-theme-color: ${colors.light.autoThemeColor};
              --auto-banner-bg-color: ${colors.light.averageColor};
            }
            .light .xlog-banner {
              background-color: var(--banner-bg-color, ${colors.light.averageColor});
            }
            .dark {
              --auto-hover-color: ${colors.dark.autoHoverColor};
              --auto-theme-color: ${colors.dark.autoThemeColor};
              --auto-banner-bg-color: ${colors.dark.averageColor};
            }
            .dark .xlog-banner {
              background-color: var(--banner-bg-color, ${colors.dark.averageColor});
            }`}
          </style>
        )}
        {site && !onlyContent && <SiteHeader handle={params.site} />}
        <main
          className={cn(
            `xlog-post-id-${page?.characterId}-${page?.noteId}`,
            "xlog-deprecated-class xlog-post-area max-w-screen-md mx-auto px-5 pt-12 relative",
          )}
        >
          {children}
        </main>
        {site && !onlyContent && (
          <section className="xlog-blockchain-info max-w-screen-md mx-auto pt-12 pb-10">
            <BlockchainInfo site={site} page={page || undefined} />
          </section>
        )}
        {!onlyContent && <SiteFooter site={site || undefined} />}
        <FABContainer>
          <BackToTopFAB />
        </FABContainer>
      </div>
    </Hydrate>
  )
}
