import { SiteLayout } from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { useGetPage } from "~/queries/page"
import type { ReactElement } from "react"
import { useRouter } from "next/router"
import { useGetSite } from "~/queries/site"

function SitePagePage() {
  const router = useRouter()
  const domainOrSubdomain = router.query.site as string
  const pageSlug = router.query.page as string

  const page = useGetPage({
    site: domainOrSubdomain,
    pageId: pageSlug,
  })

  const site = useGetSite(domainOrSubdomain)

  return <SitePage page={page.data} site={site.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout>{page}</SiteLayout>
}

export default SitePagePage
