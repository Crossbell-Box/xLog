import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import type { ReactElement } from "react"

import { QueryClient } from "@tanstack/react-query"

import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { SitePage } from "~/components/site/SitePage"
import { useUserRole } from "~/hooks/useUserRole"
import { getDefaultSlug } from "~/lib/default-slug"
import { getSiteLink } from "~/lib/helpers"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string

    const { props: layoutProps } = await getLayoutServerSideProps(
      ctx,
      queryClient,
      {
        preview: true,
      },
    )

    return {
      props: {
        ...layoutProps,
        domainOrSubdomain,
      },
    }
  },
)

function SitePagePage() {
  const router = useRouter()
  const domainOrSubdomain = router.query.site as string
  const pageSlug = router.query.page as string
  const userRole = useUserRole(domainOrSubdomain)

  const page = useGetPage({
    site: domainOrSubdomain,
    pageId: pageSlug,
  })

  const site = useGetSite(domainOrSubdomain)

  if (userRole.isSuccess && !userRole.data && page.isSuccess) {
    router.push(
      `${getSiteLink({
        subdomain: domainOrSubdomain,
      })}/${
        page.data?.slug ||
        getDefaultSlug(page.data?.title || "", page.data?.id || "")
      }`,
    )
  }

  return (
    <SitePage
      page={
        page.data
          ? {
              ...page.data,
              preview: true,
            }
          : null
      }
      site={site.data}
    />
  )
}

SitePagePage.getLayout = (page: ReactElement) => {
  return <SiteLayout type="post">{page}</SiteLayout>
}

export default SitePagePage
