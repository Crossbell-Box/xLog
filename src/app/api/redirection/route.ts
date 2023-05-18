import type { NoteEntity } from "crossbell"
import { redirect } from "next/navigation"

import { IS_VERCEL_PREVIEW } from "~/lib/constants"
import { getNoteSlug, getSiteLink } from "~/lib/helpers"
import { NextServerResponse, getQuery } from "~/lib/server-helper"
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

export async function GET(req: Request): Promise<Response> {
  let { characterId, noteId } = getQuery(req)

  const res = new NextServerResponse()
  if (!characterId || typeof characterId !== "string") {
    return res.status(400).json({ error: "Missing characterId" })
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
    const slug = getNoteSlug(note)

    link += `/${encodeURIComponent(slug)}`

    if (note.noteId + "" !== noteId) {
      link += `#comments`
    }
  }

  if (IS_VERCEL_PREVIEW) {
    const path = new URL(link).pathname

    redirect(`/site/${character.handle}${path}`)
  } else {
    redirect(link)
  }
}
