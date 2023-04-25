import { NextApiRequest, NextApiResponse } from "next"

import { getDefaultSlug } from "~/lib/default-slug"
import { IS_DEV, IS_VERCEL_PREVIEW } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { checkDomainServer } from "~/models/site.model"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { characterId, noteId } = req.query

  if (!characterId) {
    res.status(400).json({ error: "Missing characterId" })
    return
  }

  const character = await (
    await fetch(`https://indexer.crossbell.io/v1/characters/${characterId}`)
  ).json()

  let domain = character?.metadata?.content?.attributes?.find(
    (a: any) => a.trait_type === "xlog_custom_domain",
  )?.value
  if (domain && !(await checkDomainServer(domain, character.handle))) {
    domain = undefined
  }
  let link = getSiteLink({
    domain,
    subdomain: character?.handle,
  })

  if (noteId) {
    const note = await (
      await fetch(
        `https://indexer.crossbell.io/v1/characters/${characterId}/notes/${noteId}`,
      )
    ).json()
    const slug =
      note?.metadata?.content?.attributes?.find(
        (a: any) => a.trait_type === "xlog_slug",
      )?.value ||
      getDefaultSlug(note?.metadata?.content?.title, `${characterId}-${noteId}`)

    link += `/${encodeURIComponent(slug)}`
  }

  if (IS_VERCEL_PREVIEW || IS_DEV) {
    const path = new URL(link).pathname

    res.redirect(`/_site/${character.handle}${path}`)
  } else res.redirect(link)
}
