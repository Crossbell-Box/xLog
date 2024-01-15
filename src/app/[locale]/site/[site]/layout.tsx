import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { dehydrate, Hydrate } from "@tanstack/react-query"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { SitePlayerContainer } from "~/components/common/SitePlayer"
import { BackToTopFAB } from "~/components/site/BackToTopFAB"
import { CustomSiteStyle } from "~/components/site/CustomSiteStyle"
import SiteFooter from "~/components/site/SiteFooter"
import { SiteHeader } from "~/components/site/SiteHeader"
import { FABContainer } from "~/components/ui/FAB"
import { SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { isInRN } from "~/lib/is-in-rn"
import { isOnlyContent, searchParser } from "~/lib/is-only-content"
import getQueryClient from "~/lib/query-client"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"
import { withHrefLang } from "~/lib/with-hreflang"
import { fetchGetPage } from "~/queries/page.server"
import {
  fetchGetSite,
  getCharacterColors,
  prefetchGetSiteSubscriptions,
  prefetchGetSiteToSubscriptions,
} from "~/queries/site.server"

export const generateMetadata = withHrefLang<{
  params: {
    site: string
  }
}>(async ({ params }) => {
  const queryClient = getQueryClient()

  const site = await fetchGetSite(params.site, queryClient)

  const title =
    site?.metadata?.content?.site_name || site?.metadata?.content?.name
  const description = site?.metadata?.content?.bio
  const images = site?.metadata?.content?.avatars || [
    `${SITE_URL}/assets/logo.svg`,
  ]
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
          { url: "/feed", title },
          { url: "/feed/comments", title: `Comments on ${title}` },
        ],
        "application/feed+json": [
          { url: "/feed?format=json", title },
          { url: "/feed/comments?format=json", title: `Comments on ${title}` },
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
      images: images.reverse(),
      site: "@_xLog",
      creator: twitterCreator,
    },
  }
})

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

  const { inRN } = isInRN()
  const search = searchParser()
  // https://github.com/vercel/next.js/issues/46618#issuecomment-1450416633
  // Issue: The type will not be updated when the page is redirected.
  let pathname = headers().get("x-xlog-pathname")
  const onlyContent = isOnlyContent()

  if (!inRN && pathname && /^(\/site(?!\/.*\/preview\/).*)/.test(pathname)) {
    const targetPath = `${getSiteLink({
      subdomain: params.site,
    })}/${pathname.replace(/\/site\/(.*)\//, "")}`

    const targetUrl = new URL(targetPath)
    targetUrl.search = search.toString()

    redirect(targetUrl.toString())
  }

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

  const site = await fetchGetSite(params.site, queryClient)

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
        <CustomSiteStyle content={site.metadata?.content?.css || ""} />
        {colors?.light && colors?.dark && (
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
          // eslint-disable-next-line tailwindcss/no-custom-classname
          className={cn(
            `xlog-post-id-${page?.characterId}-${page?.noteId}`,
            "xlog-deprecated-class xlog-post-area max-w-screen-lg mx-auto px-5 pt-8 relative",
          )}
        >
          {children}
        </main>
        {site && !onlyContent && (
          <BlockchainInfo site={site} page={page || undefined} />
        )}
        {!onlyContent && <SiteFooter site={site || undefined} />}
        <FABContainer>
          <BackToTopFAB />
        </FABContainer>
      </div>

      <SitePlayerContainer />
    </Hydrate>
  )
}
