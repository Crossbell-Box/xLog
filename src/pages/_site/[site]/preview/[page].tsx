import { SiteLayout } from "~/components/site/SiteLayout"
import { SitePage } from "~/components/site/SitePage"
import { useGetPage } from "~/queries/page"
import type { ReactElement } from "react"
import { useRouter } from "next/router"

function SitePagePage() {
  const router = useRouter()
  const site = router.query.site as string
  const pageSlug = router.query.page as string

  const page = useGetPage({
    site: site,
    page: pageSlug,
    render: true,
    includeAuthors: true,
  })

  return <SitePage page={page.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout>{page}</SiteLayout>
}

export default SitePagePage
