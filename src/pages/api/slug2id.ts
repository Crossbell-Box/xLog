import { NextApiRequest, NextApiResponse } from "next"

import { getNoteSlug } from "~/lib/helpers"
import { cacheDelete, cacheGet } from "~/lib/redis.server"

export async function getIdBySlug(slug: string, characterId: string | number) {
  slug = (slug as string)?.toLowerCase?.()

  const result = (await cacheGet({
    key: ["slug2id", characterId, slug],
    getValueFun: async () => {
      let note
      let cursor = ""

      do {
        const response = await (
          await fetch(
            `https://indexer.crossbell.io/v1/notes?characterId=${characterId}&sources=xlog&cursor=${cursor}&limit=100`,
          )
        ).json()
        cursor = response.cursor
        note = response?.list?.find(
          (item: any) =>
            slug === getNoteSlug(item) ||
            slug === `${characterId}-${item.noteId}`,
        )
      } while (!note && cursor)

      return {
        noteId: note?.noteId,
      }
    },
    noUpdate: true,
  })) as {
    noteId: number
  }

  // revalidate
  if (result) {
    const noteIdMatch = slug.match(`^${characterId}-(\\d+)$`)
    if (!noteIdMatch?.[1]) {
      fetch(
        `https://indexer.crossbell.io/v1/characters/${characterId}/notes/${result.noteId}`,
      )
        .then((res) => res.json())
        .then((note) => {
          if ((note && getNoteSlug(note) !== slug) || note.deleted) {
            cacheDelete(["slug2id", characterId + "", slug])
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
  let { characterId, slug } = req.query

  if (!slug || !characterId) {
    res.status(400).send("Bad Request")
    return
  }

  res.status(200).send(await getIdBySlug(slug as string, characterId as string))
}
