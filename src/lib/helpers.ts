import { NoteEntity } from "crossbell.js"

import { IS_PROD } from "./constants"
import { OUR_DOMAIN } from "./env"
import pinyin from "pinyin"

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
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

export const getDefaultSlug = (title: string, id?: string) => {
  let generated =
    pinyin(title as string, {
      style: pinyin.STYLE_NORMAL,
      compact: true,
    })?.[0]
      ?.map((word) => word.trim())
      ?.filter((word) => word)
      ?.join("-")
      ?.replace(/\s+/g, "-") ||
    id?.replace(`local-`, "") ||
    ""
  generated = generated.replace(/[^a-zA-Z0-9\s-_]/g, "")

  return generated
}
