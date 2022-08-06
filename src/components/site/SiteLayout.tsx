import clsx from "clsx"
import React, { useEffect } from "react"
import { getUserContentsUrl } from "~/lib/user-contents"
import { SEOHead } from "../common/SEOHead"
import { SiteNavigationItem, Viewer, Profile, Note } from "~/lib/types"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"
import { useRouter } from "next/router"
import { useStore } from "~/lib/store"

export type SiteLayoutProps = {
  site?: Profile
  viewer?: Profile | null
  children: React.ReactNode
  title?: string | null
  ogDescription?: string | null
  page?: Note
}

export const SiteLayout: React.FC<SiteLayoutProps> = ({
  site,
  viewer,
  children,
  title,
  ogDescription,
  page,
}) => {
  const router = useRouter()
  const setSubscribeModalOpened = useStore(
    (store) => store.setSubscribeModalOpened,
  )

  useEffect(() => {
    if ("subscription" in router.query) {
      setSubscribeModalOpened(true)
    }
  }, [setSubscribeModalOpened, router.query])

  return (
    <>
      <SEOHead
        title={title || page?.title || ""}
        siteName={site?.name || ""}
        description={ogDescription ?? site?.bio}
        image={getUserContentsUrl(site?.avatars?.[0])}
      />
      <SiteHeader
        navigation={site?.navigation || []}
        siteName={site?.name}
        description={site?.bio}
        icon={site?.avatars?.[0]}
        site={site?.username}
      />
      <style>{ site?.css }</style>
      <div className={clsx(`max-w-screen-md mx-auto px-5 pb-12`, `pt-12`)}>
        {children}
      </div>
      <SiteFooter site={site} page={page} />
    </>
  )
}
