import { NoteEntity } from "crossbell.js"
import { NextApiRequest, NextApiResponse } from "next"

import { IS_VERCEL_PREVIEW } from "~/lib/constants"
import { getDefaultSlug } from "~/lib/default-slug"
import { getSiteLink } from "~/lib/helpers"
import { checkDomainServer } from "~/models/site.model"

async function getOriginalNote(
  characterId: string,
  noteId: string,
): Promise<NoteEntity> {
  const note = await (
    await fetch(
      `https://indexer.crossbell.io/v1/characters/${characterId}/notes/${noteId}`,
    )
  ).json()

  if (note?.toNote) {
    if (note?.toNote.toNoteId) {
      return await getOriginalNote(
        note?.toNote.toCharacterId,
        note?.toNote.toNoteId,
      )
    } else {
      return note.toNote
    }
  } else {
    return note
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { characterId, noteId } = req.query

  if (!characterId || typeof characterId !== "string") {
    res.status(400).json({ error: "Missing characterId" })
    return
  }

  let character
  let note

  if (noteId && typeof noteId === "string") {
    note = await getOriginalNote(characterId, noteId)
    characterId = note.characterId + ""
  }

  character = await (
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

  if (note) {
    const slug =
      note?.metadata?.content?.attributes?.find(
        (a: any) => a.trait_type === "xlog_slug",
      )?.value ||
      getDefaultSlug(
        note?.metadata?.content?.title || "",
        `${characterId}-${noteId}`,
      )

    link += `/${encodeURIComponent(slug)}`

    if (note.noteId + "" !== noteId) {
      link += `#comments`
    }
  }

  if (IS_VERCEL_PREVIEW) {
    const path = new URL(link).pathname

    res.redirect(`/_site/${character.handle}${path}`)
  } else res.redirect(link)
}
