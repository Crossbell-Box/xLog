import { GetServerSideProps } from "next"
import {
  prefetchGetSite,
  prefetchGetSiteSubscriptions,
} from "~/queries/site.server"
import { prefetchGetPagesBySite } from "~/queries/page.server"
import { PageVisibilityEnum } from "~/lib/types"
import { dehydrate } from "@tanstack/react-query"
import { queryClientServer } from "~/lib/query-client.server"
import { fetchGetPage } from "~/queries/page.server"
import { notFound } from "~/lib/server-side-props"

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
