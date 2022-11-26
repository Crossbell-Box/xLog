import React, { useEffect } from "react"
import { getUserContentsUrl } from "~/lib/user-contents"
import { SEOHead } from "../common/SEOHead"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"
import { useRouter } from "next/router"
import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { useGetSite } from "~/queries/site"
import { useGetPage } from "~/queries/page"
import { OUR_DOMAIN, SITE_URL } from "~/lib/env"
import { IS_PROD } from "~/lib/constants"
import { toGateway } from "~/lib/ipfs-parser"

export type SiteLayoutProps = {
  children: React.ReactNode
  title?: string | null
  siteId?: string
  useStat?: boolean
}

export const SiteLayout: React.FC<SiteLayoutProps> = ({
  children,
  title,
  siteId,
  useStat,
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

  useEffect(() => {
    if (site.data) {
      if (
        window.location.host.split(".").slice(-2).join(".") !== OUR_DOMAIN &&
        window.location.host !== site.data?.custom_domain &&
        IS_PROD
      ) {
        window.location.href = SITE_URL
      }
    }
  }, [site.isSuccess, site.data])

  return (
    <>
      <SEOHead
        title={title || tag || page.data?.title || ""}
        siteName={site.data?.name || ""}
        description={
          page.data?.summary?.content ??
          site.data?.description?.replace(/<[^>]*>/g, "")
        }
        image={page.data?.cover || getUserContentsUrl(site.data?.avatars?.[0])}
        icon={getUserContentsUrl(site.data?.avatars?.[0])}
      />
      {site?.data?.css && (
        <link
          type="text/css"
          rel="stylesheet"
          href={
            "data:text/css;base64," +
            Buffer.from(toGateway(site.data.css)).toString("base64")
          }
        />
      )}
      {site.data && <SiteHeader site={site.data} />}
      <div
        className={`xlog-post-id-${page.data?.id} max-w-screen-md mx-auto px-5 pt-12 relative`}
      >
        {children}
      </div>
      {site.data && (
        <div className="max-w-screen-md mx-auto pt-12 pb-10">
          <BlockchainInfo site={site.data} page={page.data} />
        </div>
      )}
      <SiteFooter site={site.data} page={page.data} />
    </>
  )
}
