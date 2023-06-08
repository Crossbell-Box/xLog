import type { NoteEntity } from "crossbell"
import { redirect } from "next/navigation"

import { IS_DEV, IS_VERCEL_PREVIEW } from "~/lib/constants"
import { getNoteSlug, getSiteLink } from "~/lib/helpers"
import { NextServerResponse, getQuery } from "~/lib/server-helper"
import { checkDomainServer } from "~/models/site.model"
import { client } from "~/queries/graphql"

async function getOriginalNote(
  characterId: string,
  noteId: string,
): Promise<NoteEntity> {
  const result = await client
    .query(
      `query getNote {
    note(
      where: {
        note_characterId_noteId_unique: {
          characterId: ${characterId},
          noteId: ${noteId},
        },
      },
    ) {
      characterId
      noteId
      deleted
      toNote {
        characterId
        noteId
        deleted
        toNote {
          characterId
          noteId
          deleted
          toNote {
            characterId
            noteId
            deleted
            metadata {
              content
            }
          }
          metadata {
            content
          }
        }
        metadata {
          content
        }
      }
      metadata {
        content
      }
    }
  }`,
      {},
    )
    .toPromise()
  const note = result.data?.note

  if (note?.toNote?.toNote?.toNote) {
    return note?.toNote?.toNote?.toNote
  } else if (note?.toNote?.toNote) {
    return note?.toNote?.toNote
  } else if (note?.toNote) {
    return note?.toNote
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

  const result = await client
    .query(
      `query getCharacter {
    character(
      where: {
        characterId: ${characterId},
      },
    ) {
      handle
      metadata {
        content
      }
    }
  }`,
      {},
    )
    .toPromise()
  character = result.data?.character

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

  if (IS_VERCEL_PREVIEW || IS_DEV) {
    const path = new URL(link).pathname

    redirect(`/site/${character.handle}${path}`)
  } else {
    redirect(link)
  }
}
