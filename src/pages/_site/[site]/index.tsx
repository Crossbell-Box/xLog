import { GetServerSideProps } from "next"
import { SiteHome } from "~/components/site/SiteHome"
import { SiteLayout } from "~/components/site/SiteLayout"
import { createSSGHelpers } from "@trpc/react/ssg"
import { getTRPCContext } from "~/lib/trpc.server"
import { Viewer, Profile, Notes } from "~/lib/types"
import { getViewer } from "~/lib/viewer"
import { useAccount } from 'wagmi'
import { useEffect, useState } from 'react'
import { queryClient, prefetchGetSite } from "~/queries/site.server"
import { useGetSite } from "~/queries/site"
import { dehydrate, QueryClient } from '@tanstack/react-query'
import { getPagesBySite } from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const domainOrSubdomain = ctx.params!.site as string

  await prefetchGetSite(domainOrSubdomain)

  const [posts] = await Promise.all([
    getPagesBySite({
      site: domainOrSubdomain,
      take: 1000,
      type: "post",
      visibility: PageVisibilityEnum.Published,
    }),
  ])

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
      posts,
      domainOrSubdomain,
    },
  }
}

function SiteIndexPage({
  posts,
  domainOrSubdomain,
}: {
  site: Profile,
  posts: Notes,
  domainOrSubdomain: string
}) {
  const site = useGetSite(domainOrSubdomain)

  return (
    <SiteLayout site={site.data}>
      <SiteHome posts={posts} />
    </SiteLayout>
  )
}

export default SiteIndexPage
