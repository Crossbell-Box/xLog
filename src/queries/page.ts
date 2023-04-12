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
import { useContract } from "@crossbell/contract"
import { NoteEntity } from "crossbell.js"

import * as pageModel from "~/models/page.model"

import { useUnidata } from "./unidata"
import { getDefaultSlug } from "~/lib/helpers"

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

export const useGetSearchPagesBySite = (
  input: Parameters<typeof pageModel.getSearchPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getSearchPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      return pageModel.getSearchPagesBySite({
        ...input,
        cursor: pageParam,
      })
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
  return useIsNoteLiked(pageModel.parsePageId(pageId))
}

export const useGetMints = (input: {
  pageId?: string
  includeCharacter?: boolean
}) => {
  return useInfiniteQuery({
    queryKey: ["getMints", input.pageId, input],
    queryFn: async ({ pageParam }) => {
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
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
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

export function usePostNotes() {
  const queryClient = useQueryClient()
  const contract = useContract()
  const mutation = useMutation(
    async (payload: Parameters<typeof pageModel.postNotes>[0]) => {
      return pageModel.postNotes(payload, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getPagesBySite", variables.siteId])
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
  const { mutateAsync: _, ...postNoteForNote } = usePostNoteForNote({
    noAutoResume: true,
  })

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

export function useUpdateComment() {
  const queryClient = useQueryClient()
  const contract = useContract()

  return useMutation(
    async (payload: Parameters<typeof pageModel.updateComment>[0]) => {
      return pageModel.updateComment(payload, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getComments",
          variables.originalId || variables.pageId,
        ])
      },
    },
  )
}

export function useGetComments(input: { pageId?: string }) {
  return useInfiniteQuery({
    queryKey: ["getComments", input.pageId],
    queryFn: async ({ pageParam }) => {
      if (!input.pageId) {
        return
      }
      return pageModel.getComments({
        pageId: input.pageId,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
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

export function useGetMirrorXyz(input: { address: string }) {
  return useQuery(["getMirror", input.address], async () => {
    if (!input.address) {
      return null
    }
    const response = await (
      await fetch(
        "/api/import/mirror.xyz?" +
          new URLSearchParams({
            ...input,
          } as any),
      )
    ).json()

    return response?.data?.projectFeed?.posts?.map((post: any) => {
      return {
        title: post.title,
        date_published: new Date(
          post.publishedAtTimestamp * 1000,
        ).toISOString(),
        slug: getDefaultSlug(post.title, post.digest),
        tags: ["Mirror.xyz"],
        content: post.body,
        external_urls: [`https://mirror.xyz/${input.address}/${post.digest}`],
      }
    }) as {
      title: string
      type: string
      size: number
      date_published: string
      slug: string
      tags: string[]
      content: string
      external_urls: string[]
    }[]
  })
}

export function useCheckMirror(characterId?: string) {
  return useQuery(["checkMirror", characterId], async () => {
    if (!characterId) {
      return
    }
    return pageModel.checkMirror(characterId)
  })
}
