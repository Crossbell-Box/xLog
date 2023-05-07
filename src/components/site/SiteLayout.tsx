import { useRouter } from "next/navigation"
import React, { useEffect } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { Style } from "~/components/common/Style"
import { useUserRole } from "~/hooks/useUserRole"
import { IS_PROD, IS_VERCEL_PREVIEW } from "~/lib/constants"
import { OUR_DOMAIN, SITE_URL } from "~/lib/env"
import { getUserContentsUrl } from "~/lib/user-contents"
import { cn } from "~/lib/utils"
import { useCheckLike, useCheckMint, useGetPage } from "~/queries/page"
import { useGetSite, useGetSubscription } from "~/queries/site"

import { SEOHead } from "../common/SEOHead"
import { FABContainer } from "../ui/FAB"
import { BackToTopFAB } from "./BackToTopFAB"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

export type SiteLayoutProps = {
  children: React.ReactNode
  title?: string | null
  siteId?: string
  useStat?: boolean
  type: "index" | "post" | "tag" | "nft" | "404" | "archive"
}

export const SiteLayout: React.FC<SiteLayoutProps> = ({
  children,
  title,
  siteId,
  useStat,
  type,
}) => {
  const router = useRouter()
  const domainOrSubdomain = (router.query.site || siteId) as string
  const pageSlug = router.query.page as string
  const tag = router.query.tag as string

  const site = useGetSite(domainOrSubdomain)

  const page = useGetPage({
    characterId: site.data?.characterId,
    slug: pageSlug,
    ...(useStat && {
      useStat: true,
    }),
  })

  const isConnected = useAccountState((s) => !!s.computed.account)
  const userRole = useUserRole(domainOrSubdomain)
  const subscription = useGetSubscription(site.data?.characterId)
  const [{ isLiked }] = useCheckLike({
    characterId: page.data?.characterId,
    noteId: page.data?.noteId,
  })
  const isMint = useCheckMint({
    characterId: page.data?.characterId,
    noteId: page.data?.noteId,
  })

  useEffect(() => {
    if (site.data) {
      if (
        window.location.host.split(".").slice(-2).join(".") !== OUR_DOMAIN &&
        window.location.host !== site.data?.metadata?.content?.custom_domain &&
        IS_PROD &&
        !IS_VERCEL_PREVIEW
      ) {
        window.location.href = SITE_URL
      }
    }
  }, [site.isSuccess, site.data])

  return (
    <div
      className={cn(
        {
          "xlog-user": true,
          "xlog-user-login": isConnected,
          "xlog-user-site-owner": userRole?.data === "owner",
          "xlog-user-site-operator": userRole?.data === "operator",
          "xlog-user-site-follower": subscription?.data,
          "xlog-user-post-liker": isLiked,
          "xlog-user-post-minter": isMint?.data?.count,
        },
        `xlog-page-${type}`,
      )}
    >
      <SEOHead
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
      />
      <Style content={site.data?.metadata?.content?.css} />
      {site.data && <SiteHeader site={site.data} />}
      <div
        className={cn(
          `xlog-post-id-${page.data?.characterId}-${page.data?.noteId} max-w-screen-md mx-auto px-5 pt-12 relative`,
          page.data?.metadata?.content?.tags?.map(
            (tag) => `xlog-post-tag-${tag}`,
          ),
        )}
      >
        {children}
      </div>
      {site.data && (
        <div className="max-w-screen-md mx-auto pt-12 pb-10">
          <BlockchainInfo site={site.data} page={page.data || undefined} />
        </div>
      )}
      <SiteFooter site={site.data || undefined} />

      <FABContainer>
        <BackToTopFAB />
      </FABContainer>
    </div>
  )
}
