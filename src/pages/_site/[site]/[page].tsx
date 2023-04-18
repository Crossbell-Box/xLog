import { QueryClient } from "@tanstack/react-query"
import { GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { ReactElement, useEffect } from "react"
import { scroller } from "react-scroll"
import { SiteLayout } from "~/components/site/SiteLayout"
import { getServerSideProps as getLayoutServerSideProps } from "~/components/site/SiteLayout.server"
import { SitePage } from "~/components/site/SitePage"
import { serverSidePropsHandler } from "~/lib/server-side-props"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

export const getServerSideProps: GetServerSideProps = serverSidePropsHandler(
  async (ctx) => {
    const queryClient = new QueryClient()
    const domainOrSubdomain = ctx.params!.site as string
    const pageSlug = ctx.params!.page as string

    const { props: layoutProps } = await getLayoutServerSideProps(
      ctx,
      queryClient,
      {
        useStat: true,
      },
    )

    return {
      props: {
        ...layoutProps,
        domainOrSubdomain,
        pageSlug,
      },
    }
  },
)

function SitePagePage({
  domainOrSubdomain,
  pageSlug,
}: {
  domainOrSubdomain: string
  pageSlug: string
}) {
  const page = useGetPage({
    site: domainOrSubdomain,
    page: pageSlug,
    useStat: true,
  })
  const site = useGetSite(domainOrSubdomain)

  const { asPath } = useRouter()
  useEffect(() => {
    const [, hash] = asPath.split("#")
    if (hash) {
      scroller.scrollTo(decodeURIComponent(hash), {
        smooth: true,
        offset: -20,
      })
    }
  }, [])

  return <SitePage page={page.data} site={site.data} />
}

SitePagePage.getLayout = (page: ReactElement) => {
  return (
    <SiteLayout useStat={true} type="post">
      {page}
    </SiteLayout>
  )
}

export default SitePagePage
