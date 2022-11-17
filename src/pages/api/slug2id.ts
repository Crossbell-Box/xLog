import { NextApiRequest, NextApiResponse } from "next"
import { cacheGet, cacheDelete } from "~/lib/redis.server"

const getSlug = (note: any) => {
  return (
    note.metadata?.content?.attributes?.find(
      (a: any) => a?.trait_type === "xlog_slug",
    )?.value ||
    note.metadata?.content?._xlog_slug ||
    note.metadata?.content?._crosslog_slug
  )?.toLowerCase?.()
}

export async function getIdBySlug(slug: string, handle: string) {
  slug = (slug as string)?.toLowerCase?.()

  const result = await cacheGet(
    ["slug2id", handle, slug],
    async () => {
      let note
      let cursor = ""

      const characterRes = await (
        await fetch(
          `https://indexer.crossbell.io/v1/handles/${handle}/character`,
        )
      ).json()
      const cid = characterRes?.characterId

      do {
        const response = await (
          await fetch(
            `https://indexer.crossbell.io/v1/notes?characterId=${cid}&sources=xlog&cursor=${cursor}&limit=100`,
          )
        ).json()
        cursor = response.cursor
        note = response?.list?.find(
          (item: any) => slug === (getSlug(item) || `${cid}-${item.noteId}`),
        )
      } while (!note && cursor)

      if (note?.noteId) {
        return {
          noteId: note?.noteId,
          characterId: cid,
        }
      }
    },
    true,
  )

  if (result) {
    fetch(
      `https://indexer.crossbell.io/v1/characters/${result.characterId}/notes/${result.noteId}`,
    )
      .then((res) => res.json())
      .then((note) => {
        if (note) {
          const currentSlug =
            getSlug(note) || `${result.characterId}-${note.noteId}`
          if (currentSlug !== slug) {
            cacheDelete(["slug2id", handle, slug])
          }
        } else {
          cacheDelete(["slug2id", handle, slug])
        }
      })
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
