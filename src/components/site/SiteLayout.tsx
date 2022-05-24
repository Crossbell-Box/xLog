import clsx from "clsx"
import React from "react"
import { getUserContentsUrl } from "~/lib/user-contents"
import { SubscribeModal } from "../common/SubscribeModal"
import { SEOHead } from "../common/SEOHead"
import { SiteNavigationItem, Viewer } from "~/lib/types"
import { SiteFooter } from "./SiteFooter"
import { SiteHeader } from "./SiteHeader"

export type SiteLayoutProps = {
  site: {
    id: string
    name: string
    description?: string | null
    icon?: string | null
    navigation?: SiteNavigationItem[] | null
  }
  viewer: Viewer | null
  subscription?: { email?: boolean } | null
  children: React.ReactNode
  title?: string | null
  ogDescription?: string | null
}

export const SiteLayout: React.FC<SiteLayoutProps> = ({
  site,
  viewer,
  subscription,
  children,
  title,
  ogDescription,
}) => {
  return (
    <>
      <SEOHead
        title={title || ""}
        siteName={site.name}
        description={ogDescription ?? site.description}
        image={getUserContentsUrl(site.icon)}
      />
      <SiteHeader
        navigation={site!.navigation || []}
        siteName={site!.name}
        description={site?.description}
        icon={site!.icon}
        subscribed={!!subscription}
        viewer={viewer}
      />
      <div className={clsx(`max-w-screen-md mx-auto px-5 pb-12`, `pt-12`)}>
        {children}
      </div>
      <SiteFooter site={{ name: site!.name }} />
      {site.id && (
        <SubscribeModal
          siteId={site.id}
          subscription={subscription}
          isLoggedIn={!!viewer}
        />
      )}
    </>
  )
}
