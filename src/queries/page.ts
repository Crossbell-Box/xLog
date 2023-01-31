import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import {
  useAccountState,
  usePostNoteForNote,
  useLikeNote,
  useUnlikeNote,
  useMintNote,
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

export const useGetLikes = (input: {
  pageId?: string
  includeCharacter?: boolean
}) => {
  return useQuery(
    ["getLikes", input.pageId, input.includeCharacter],
    async () => {
      if (!input.pageId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return pageModel.getLikes({
        pageId: input.pageId,
        includeCharacter: input.includeCharacter,
      })
    },
  )
}

export const useCheckLike = (input: { pageId?: string }) => {
  const account = useAccountState((s) => s.computed.account)

  return useQuery(
    ["checkLike", input.pageId, account?.characterId],
    async () => {
      if (!input.pageId || !account?.characterId) {
        return { count: 0, list: [] }
      }

      return pageModel.checkLike({ account, pageId: input.pageId })
    },
  )
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

export function useLikePage() {
  const queryClient = useQueryClient()
  const account = useAccountState((s) => s.computed.account)

  return useLikeNote({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "checkLike",
        pageModel.toPageId(variables),
        account?.characterId,
      ])
      queryClient.invalidateQueries(["getLikes", pageModel.toPageId(variables)])
    },
  })
}

export function useUnlikePage() {
  const queryClient = useQueryClient()
  const account = useAccountState((s) => s.computed.account)

  return useUnlikeNote({
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries([
        "checkLike",
        pageModel.toPageId(variables),
        account?.characterId,
      ])
      queryClient.invalidateQueries(["getLikes", pageModel.toPageId(variables)])
    },
  })
}

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
