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

export type SiteLayoutProps = {
  children: React.ReactNode
  title?: string | null
}

export const SiteLayout: React.FC<SiteLayoutProps> = ({ children, title }) => {
  const router = useRouter()
  const domainOrSubdomain = router.query.site as string
  const pageSlug = router.query.page as string
  const tag = router.query.tag as string

  const page = useGetPage({
    site: domainOrSubdomain,
    page: pageSlug,
    render: true,
    includeAuthors: true,
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
      <SiteHeader site={site.data} />
      <style>{site.data?.css}</style>
      <div
        className={`xlog-post-id-${page.data?.id} max-w-screen-md mx-auto px-5 pt-12 relative`}
      >
        {children}
      </div>
      <div className="max-w-screen-md mx-auto pt-12 pb-10">
        <BlockchainInfo site={site.data} page={page.data} />
      </div>
      <SiteFooter site={site.data} page={page.data} />
    </>
  )
}
