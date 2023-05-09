import { QueryClient } from "@tanstack/react-query"

import { getSummary } from "~/app/api/summary/route"
import { getNoteSlug } from "~/lib/helpers"
import { cacheDelete, cacheGet } from "~/lib/redis.server"
import * as pageModel from "~/models/page.model"

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

export const fetchGetPage = async (
  input: Partial<Parameters<typeof pageModel.getPage>[0]>,
  queryClient: QueryClient,
) => {
  const key = ["getPage", input.characterId, input]
  return await queryClient.fetchQuery(key, async () => {
    if (!input.characterId || !input.slug) {
      return null
    }
    if (!input.noteId) {
      const slug2Id = await getIdBySlug(input.slug, input.characterId)
      if (!slug2Id?.noteId) {
        return null
      }
      input.noteId = slug2Id.noteId
    }
    return cacheGet({
      key,
      getValueFun: () =>
        pageModel.getPage({
          slug: input.slug,
          characterId: input.characterId!,
          useStat: input.useStat,
          noteId: input.noteId,
          handle: input.handle,
        }),
    }) as Promise<ReturnType<typeof pageModel.getPage>>
  })
}

export const prefetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.characterId, input]
  await queryClient.prefetchInfiniteQuery({
    queryKey: key,
    queryFn: async ({ pageParam }) => {
      return cacheGet({
        key,
        getValueFun: () =>
          pageModel.getPagesBySite({
            ...input,
            cursor: pageParam,
          }),
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const fetchGetPagesBySite = async (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
  queryClient: QueryClient,
) => {
  const key = ["getPagesBySite", input.characterId, input]
  return await queryClient.fetchQuery(key, async () => {
    return cacheGet({
      key,
      getValueFun: () => pageModel.getPagesBySite(input),
    }) as Promise<ReturnType<typeof pageModel.getPagesBySite>>
  })
}

export const prefetchGetSummary = async (
  input: { cid?: string; lang?: string },
  queryClient: QueryClient,
) => {
  const key = ["getSummary", input.cid, input.lang]
  await queryClient.fetchQuery(key, async () => {
    if (!input.cid || !input.lang) {
      return
    }
    return getSummary(input.cid, input.lang)
  })
}
