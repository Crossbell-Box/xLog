import { useRouter } from "next/router"
import React, { useEffect } from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { Style } from "~/components/common/Style"
import { useUserRole } from "~/hooks/useUserRole"
import { IS_PROD } from "~/lib/constants"
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

  const page = useGetPage({
    site: domainOrSubdomain,
    page: pageSlug,
    ...(useStat && {
      useStat: true,
    }),
  })

  const site = useGetSite(domainOrSubdomain)

  const isConnected = useAccountState((s) => !!s.computed.account)
  const userRole = useUserRole(domainOrSubdomain)
  const subscription = useGetSubscription(domainOrSubdomain)
  const [{ isLiked }] = useCheckLike({ pageId: page.data?.id })
  const isMint = useCheckMint(page.data?.id)

  useEffect(() => {
    if (site.data) {
      if (
        window.location.host.split(".").slice(-2).join(".") !== OUR_DOMAIN &&
        window.location.host !== site.data?.metadata?.content?.custom_domain &&
        IS_PROD
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
        title={title || tag || page.data?.title || ""}
        siteName={site.data?.metadata?.content?.name || ""}
        description={
          page.data?.summary?.content ??
          site.data?.metadata?.content?.bio?.replace(/<[^>]*>/g, "")
        }
        image={
          page.data?.cover ||
          getUserContentsUrl(site.data?.metadata?.content?.avatars?.[0])
        }
        icon={getUserContentsUrl(site.data?.metadata?.content?.avatars?.[0])}
        site={domainOrSubdomain}
      />
      <Style content={site.data?.metadata?.content?.css} />
      {site.data && <SiteHeader site={site.data} />}
      <div
        className={cn(
          `xlog-post-id-${page.data?.id} max-w-screen-md mx-auto px-5 pt-12 relative`,
          page.data?.tags?.map((tag) => `xlog-post-tag-${tag}`),
        )}
      >
        {children}
      </div>
      {site.data && (
        <div className="max-w-screen-md mx-auto pt-12 pb-10">
          <BlockchainInfo site={site.data} page={page.data} />
        </div>
      )}
      <SiteFooter site={site.data || undefined} page={page.data} />

      <FABContainer>
        <BackToTopFAB />
      </FABContainer>
    </div>
  )
}
