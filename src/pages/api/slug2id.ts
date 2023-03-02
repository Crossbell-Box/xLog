import { NextApiRequest, NextApiResponse } from "next"

import { cacheGet, cacheDelete } from "~/lib/redis.server"
import { getNoteSlug } from "~/lib/helpers"

export async function getIdBySlug(slug: string, handle: string) {
  slug = (slug as string)?.toLowerCase?.()

  const result = await cacheGet({
    key: ["slug2id", handle, slug],
    getValueFun: async () => {
      let note
      let cursor = ""

      const characterRes = await (
        await fetch(
          `https://indexer.crossbell.io/v1/handles/${handle}/character`,
        )
      ).json()
      const cid = characterRes?.characterId

      const noteIdMatch = slug.match(`^${cid}-(\\d+)$`)
      if (noteIdMatch?.[1]) {
        return {
          noteId: noteIdMatch?.[1],
          characterId: cid,
        }
      }

      do {
        const response = await (
          await fetch(
            `https://indexer.crossbell.io/v1/notes?characterId=${cid}&sources=xlog&cursor=${cursor}&limit=100`,
          )
        ).json()
        cursor = response.cursor
        note = response?.list?.find(
          (item: any) =>
            slug === getNoteSlug(item) || slug === `${cid}-${item.noteId}`,
        )
      } while (!note && cursor)

      if (note?.noteId) {
        return {
          noteId: note?.noteId,
          characterId: cid,
        }
      }
    },
    noUpdate: true,
  })

  // revalidate
  if (result) {
    const noteIdMatch = slug.match(`^${result.characterId}-(\\d+)$`)
    if (!noteIdMatch?.[1]) {
      fetch(
        `https://indexer.crossbell.io/v1/characters/${result.characterId}/notes/${result.noteId}`,
      )
        .then((res) => res.json())
        .then((note) => {
          if ((note && getNoteSlug(note) !== slug) || note.deleted) {
            cacheDelete(["slug2id", handle, slug])
          }
        })
      fetch(`https://indexer.crossbell.io/v1/characters/${result.characterId}`)
        .then((res) => res.json())
        .then((character) => {
          if (character && character.handle !== handle) {
            cacheDelete(["slug2id", handle, slug])
          }
        })
    }
  }

  return result
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { handle, slug } = req.query

  if (!slug || !handle) {
    res.status(400).send("Bad Request")
    return
  }

  res.status(200).send(await getIdBySlug(slug as string, handle as string))
}
