import { NoteEntity } from "crossbell.js"

import { Note, Profile } from "~/lib/types"

import { IS_PROD } from "./constants"
import { IS_VERCEL_PREVIEW, OUR_DOMAIN } from "./env"

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

export const getNoteSlug = (note: NoteEntity) => {
  return (
    note.metadata?.content?.attributes?.find(
      (a) => a?.trait_type === "xlog_slug",
    )?.value ||
    (note.metadata?.content as any)?._xlog_slug ||
    (note.metadata?.content as any)?._crosslog_slug
  )?.toLowerCase?.()
}

export const getNoteSlugFromNote = (page: Note) => {
  return page.attributes?.find(($) => $.trait_type === "xlog_slug")?.value
}

export const getTwitterShareUrl = ({
  page,
  site,
  t,
}: {
  page: Note
  site: Profile
  t: (key: string, options?: any) => string
}) => {
  const slug = getNoteSlugFromNote(page)

  if (!slug) {
    return ""
  }

  return `https://twitter.com/intent/tweet?url=${getSiteLink({
    subdomain: site.username!,
    domain: site.custom_domain,
  })}/${encodeURIComponent(slug)}&via=_xLog&text=${encodeURIComponent(
    t(
      `Published a new post on my blockchain blog: {{title}}. Check it out now!`,
      {
        title: page.title,
      },
    ),
  )}`
}
