import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import {
  useAccountState,
  usePostNoteForNote,
  useMintNote,
  useToggleLikeNote,
  useIsNoteLiked,
  useNoteLikeList,
  useNoteLikeCount,
} from "@crossbell/connect-kit"
import { useRefCallback } from "@crossbell/util-hooks"

import * as pageModel from "~/models/page.model"

import { useUnidata } from "./unidata"

export const useGetPagesBySiteLite = (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.site, input],
    queryFn: async ({ pageParam }) => {
      const result: ReturnType<typeof pageModel.getPagesBySite> = await (
        await fetch(
          "/api/pages?" +
            new URLSearchParams({
              ...input,
              ...(pageParam && { cursor: pageParam }),
            } as any),
        )
      ).json()
      return result
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const useGetPagesBySite = (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  const unidata = useUnidata()
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.site, input],
    queryFn: async ({ pageParam }) => {
      return pageModel.getPagesBySite(
        {
          ...input,
          cursor: pageParam,
        },
        unidata,
      )
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const useGetPage = (input: Parameters<typeof pageModel.getPage>[0]) => {
  const unidata = useUnidata()
  return useQuery(["getPage", input.page || input.pageId, input], async () => {
    if (!input.site || !(input.page || input.pageId)) {
      return null
    }
    return pageModel.getPage(input, unidata)
  })
}

export const useGetLikeCounts = ({ pageId = "" }: { pageId?: string }) => {
  return useNoteLikeCount(pageModel.parsePageId(pageId))
}

export const useGetLikes = ({ pageId = "" }: { pageId?: string }) => {
  return useNoteLikeList(pageModel.parsePageId(pageId))
}

export const useCheckLike = ({ pageId = "" }: { pageId?: string }) => {
  const { characterId, noteId } = pageModel.parsePageId(pageId)

  return useIsNoteLiked({ toNoteId: noteId, toCharacterId: characterId })
}

export const useGetMints = (input: {
  pageId?: string
  includeCharacter?: boolean
}) => {
  return useQuery(
    ["getMints", input.pageId, input.includeCharacter],
    async () => {
      if (!input.pageId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return pageModel.getMints({
        pageId: input.pageId,
        includeCharacter: input.includeCharacter,
      })
    },
  )
}

export const useCheckMint = (pageId: string | undefined) => {
  const address = useAccountState((s) => s.wallet?.address)

  return useQuery(["checkMint", pageId, address], async () => {
    if (!pageId || !address) {
      return { count: 0, list: [] }
    }

    return pageModel.checkMint({ pageId, address })
  })
}

export function useCreateOrUpdatePage() {
  const newbieToken = useAccountState((s) => s.email?.token)
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof pageModel.createOrUpdatePage>[0]) => {
      return pageModel.createOrUpdatePage(payload, unidata, newbieToken)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getPagesBySite", variables.siteId])
        queryClient.invalidateQueries(["getPage", variables.pageId])
      },
    },
  )
  return mutation
}

export function useDeletePage() {
  const newbieToken = useAccountState((s) => s.email?.token)
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.deletePage>[0]) => {
      return pageModel.deletePage(input, unidata, newbieToken)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getPagesBySite", variables.site])
        queryClient.invalidateQueries(["getPage", variables.id])
      },
    },
  )
}

export const useToggleLikePage = useToggleLikeNote

export function useMintPage() {
  const queryClient = useQueryClient()
  const address = useAccountState((s) => s.wallet?.address)

  return useMintNote({
    onSuccess: (_, variables) => {
      const pageId = pageModel.toPageId(variables)

      return Promise.all([
        queryClient.invalidateQueries(["checkMint", pageId, address]),
        queryClient.invalidateQueries(["getMints", pageId]),
      ])
    },
  })
}

export function useCommentPage() {
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...postNoteForNote } = usePostNoteForNote()

  const mutate = useRefCallback(
    ({
      pageId,
      content,
      externalUrl,
      originalId,
    }: {
      pageId: string
      content: string
      externalUrl: string
      originalId?: string
    }) => {
      return postNoteForNote.mutate(
        {
          note: pageModel.parsePageId(pageId),
          metadata: {
            content,
            external_urls: [externalUrl],
            tags: ["comment"],
            sources: ["xlog"],
          },
        },
        {
          onSuccess() {
            queryClient.invalidateQueries(["getComments", originalId || pageId])
          },
        },
      )
    },
  )

  return {
    ...postNoteForNote,
    mutate,
  }
}

export function useGetComments(input: { pageId?: string }) {
  return useQuery(["getComments", input.pageId], async () => {
    if (!input.pageId) {
      return
    }
    return pageModel.getComments({
      pageId: input.pageId,
    })
  })
}

export function useGetSummary(input: { cid?: string; lang?: string }) {
  return useQuery(["getSummary", input.cid, input.lang], async () => {
    if (!input.cid || !input.lang) {
      return
    }
    return pageModel.getSummary({
      cid: input.cid,
      lang: input.lang,
    })
  })
}
