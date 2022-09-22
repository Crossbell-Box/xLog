import React, { useEffect } from "react"
import { getUserContentsUrl } from "~/lib/user-contents"
import { SEOHead } from "../common/SEOHead"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"
import { useRouter } from "next/router"
import { useStore } from "~/lib/store"
import { BlockchainInfo } from "~/components/common/BlockchainInfo"
import { GetServerSideProps } from "next"
import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
} from "~/queries/site.server"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { useGetSiteSubscriptions } from "~/queries/site"
import { dehydrate } from "@tanstack/react-query"
import { queryClientServer } from "~/lib/query-client.server"
import { useGetSite } from "~/queries/site"
import { fetchGetPage } from "~/queries/page.server"
import { notFound } from "~/lib/server-side-props"
import { useGetPage } from "~/queries/page"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const domainOrSubdomain = ctx.params!.site as string
  const pageSlug = ctx.params!.page as string
  const tag = ctx.params!.tag as string

  await prefetchGetSite(domainOrSubdomain)
  await prefetchGetSiteSubscriptions({
    siteId: domainOrSubdomain,
  })

  if (pageSlug) {
    const page = await fetchGetPage({
      site: domainOrSubdomain,
      page: pageSlug,
      render: true,
      includeAuthors: true,
    })

    if (new Date(page!.date_published) > new Date()) {
      throw notFound()
    }
  } else {
    await prefetchGetPagesBySite({
      site: domainOrSubdomain,
      take: 1000,
      type: "post",
      visibility: PageVisibilityEnum.Published,
      render: true,
      ...(tag && { tags: [tag] }),
    })
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClientServer),
    },
  }
}

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

  const setSubscribeModalOpened = useStore(
    (store) => store.setSubscribeModalOpened,
  )
  const site = useGetSite(domainOrSubdomain)
  const subscriptions = useGetSiteSubscriptions({
    siteId: domainOrSubdomain,
  })

  useEffect(() => {
    if ("subscription" in router.query) {
      setSubscribeModalOpened(true)
    }
  }, [setSubscribeModalOpened, router.query])

  return (
    <>
      <SEOHead
        title={title || tag || page.data?.title || ""}
        siteName={site.data?.name || ""}
        description={
          (page.data?.summary?.content || page.data?.body?.content) ??
          site.data?.description?.replace(/<[^>]*>/g, "")
        }
        image={page.data?.cover || getUserContentsUrl(site.data?.avatars?.[0])}
        icon={getUserContentsUrl(site.data?.avatars?.[0])}
      />
      <SiteHeader site={site.data} subscriptions={subscriptions.data} />
      <style>{site.data?.css}</style>
      <div
        className={`xlog-post-id-${page.data?.id} max-w-screen-md mx-auto px-5 pt-12`}
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
