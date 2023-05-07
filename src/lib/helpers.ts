import type { NoteEntity } from "crossbell.js"

import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { IS_PROD, IS_VERCEL_PREVIEW } from "./constants"
import { OUR_DOMAIN } from "./env"
import { isServerSide } from "./utils"

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
  if (IS_VERCEL_PREVIEW) return `/_site/${subdomain}`

  if (domain) {
    return `https://${domain}`
  }
  if (noProtocol) {
    return `${subdomain}.${OUR_DOMAIN}`
  }

  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}

export const getSlugUrl = (slug: string) => {
  if (!isServerSide() && IS_VERCEL_PREVIEW) {
    const pathArr = new URL(location.href).pathname.split("/").filter(($) => $)
    const indicatorIndex = pathArr.findIndex(($) => $ === "_site")
    if (-~indicatorIndex) {
      const handle = pathArr[indicatorIndex + 1]

      return `/_site/${handle}${slug}`
    }
  }

  return slug
}

export const getNoteSlug = (note: NoteEntity) => {
  return (
    note.metadata?.content?.attributes?.find(
      (a) => a?.trait_type === "xlog_slug",
    )?.value ||
    (note.metadata?.content as any)?._xlog_slug ||
    (note.metadata?.content as any)?._crosslog_slug
  )?.toLowerCase?.()
}

export const getNoteSlugFromNote = (page: ExpandedNote) => {
  return page.metadata?.content?.attributes?.find(
    ($) => $.trait_type === "xlog_slug",
  )?.value
}

export const getTwitterShareUrl = ({
  page,
  site,
  t,
}: {
  page: ExpandedNote
  site: ExpandedCharacter
  t: (key: string, options?: any) => string
}) => {
  const slug = getNoteSlugFromNote(page)

  if (!slug) {
    return ""
  }

  return `https://twitter.com/intent/tweet?url=${getSiteLink({
    subdomain: site.handle!,
    domain: site.metadata?.content?.custom_domain,
  })}/${encodeURIComponent(slug)}&via=_xLog&text=${encodeURIComponent(
    t(
      `Published a new post on my blockchain blog: {{title}}. Check it out now!`,
      {
        title: page.metadata?.content?.title,
      },
    ),
  )}`
}
