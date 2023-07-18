import type { NoteEntity } from "crossbell"
import { TFunction } from "i18next"

import { ExpandedCharacter, ExpandedNote } from "~/lib/types"

import { IS_PROD, IS_VERCEL_PREVIEW } from "./constants"
import { OUR_DOMAIN } from "./env"

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
  if (IS_VERCEL_PREVIEW) return `/site/${subdomain}`

  if (domain) {
    return `https://${domain}`
  }
  if (noProtocol) {
    return `${subdomain}.${OUR_DOMAIN}`
  }

  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}

export const getNoteSlug = (note: NoteEntity) => {
  return encodeURIComponent(
    note.metadata?.content?.attributes?.find(
      (a) => a?.trait_type === "xlog_slug",
    )?.value ||
      note.metadata?.content?.title ||
      "",
  )
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
  t: TFunction<string, undefined>
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

export const getSiteRelativeUrl = (pathname: string, address: string) => {
  if (address.match(/^https?:\/\//)) {
    return address
  }
  if (!address.startsWith("/")) {
    address = `/${address}`
  }
  const reg = /\/(site|post)\/([^/]*)/
  if (address.match(reg)) {
    return address
  } else {
    const match = pathname.match(reg)
    if (match?.[2]) {
      return `/site/${match[2]}${address === "/" ? "" : address}`
    } else {
      return address
    }
  }
}
