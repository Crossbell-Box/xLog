"use client"

import {
  useAccountState,
  useIsNoteLiked,
  useMintNote,
  useNoteLikeCount,
  useNoteLikeList,
  usePostNoteForNote,
  useToggleLikeNote,
} from "@crossbell/connect-kit"
import { useContract } from "@crossbell/contract"
import { useRefCallback } from "@crossbell/util-hooks"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import * as pageModel from "~/models/page.model"

import { useUnidata } from "./unidata"

export const useGetPagesBySiteLite = (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
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
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      return pageModel.getPagesBySite({
        ...input,
        cursor: pageParam,
      })
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

export const useGetPage = (
  input: Partial<Parameters<typeof pageModel.getPage>[0]>,
) => {
  return useQuery(["getPage", input.characterId, input], async () => {
    if (!input.characterId || (!input.slug && !input.noteId)) {
      return null
    }
    return pageModel.getPage({
      characterId: input.characterId,
      slug: input.slug,
      noteId: input.noteId,
      useStat: input.useStat,
      handle: input.handle,
    })
  })
}

export const useGetLikeCounts = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useNoteLikeCount({
    characterId: characterId || 0,
    noteId: noteId || 0,
  })
}

export const useGetLikes = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useNoteLikeList({
    characterId: characterId || 0,
    noteId: noteId || 0,
  })
}

export const useCheckLike = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  return useIsNoteLiked({
    characterId: characterId || 0,
    noteId: noteId || 0,
  })
}

export const useGetMints = (input: {
  characterId?: number
  noteId?: number
  includeCharacter?: boolean
}) => {
  return useInfiniteQuery({
    queryKey: ["getMints", input.characterId, input.noteId, input],
    queryFn: async ({ pageParam }) => {
      if (!input.characterId || !input.noteId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return pageModel.getMints({
        characterId: input.characterId,
        noteId: input.noteId,
        includeCharacter: input.includeCharacter,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const useCheckMint = ({
  characterId,
  noteId,
}: {
  characterId?: number
  noteId?: number
}) => {
  const address = useAccountState((s) => s.wallet?.address)

  return useQuery(["checkMint", characterId, noteId, address], async () => {
    if (!characterId || !noteId || !address) {
      return { count: 0, list: [] }
    }

    return pageModel.checkMint({
      noteCharacterId: characterId,
      noteId: noteId,
      address,
    })
  })
}

export const useCheckComment = ({
  noteCharacterId,
  noteId,
}: {
  noteCharacterId?: number
  noteId?: number
}) => {
  const account = useAccountState((s) => s.computed.account)

  return useQuery(
    ["checkMint", noteCharacterId, noteId, account?.characterId],
    async () => {
      if (!noteCharacterId || !noteId || !account?.characterId) {
        return { count: 0, list: [] }
      }

      return pageModel.checkComment({
        characterId: account?.characterId,
        noteCharacterId: noteCharacterId,
        noteId: noteId,
      })
    },
  )
}

export function useCreateOrUpdatePage() {
  const newbieToken = useAccountState((s) => s.email?.token)
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (
      payload: Parameters<typeof pageModel.createOrUpdatePage>[0] & {
        characterId?: number
      },
    ) => {
      return pageModel.createOrUpdatePage(payload, unidata, newbieToken)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getPagesBySite", variables.characterId])
        queryClient.invalidateQueries(["getPage", variables.characterId])
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
        queryClient.invalidateQueries(["getPagesBySite", variables.characterId])
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
    async (
      input: Parameters<typeof pageModel.deletePage>[0] & {
        characterId?: number
      },
    ) => {
      return pageModel.deletePage(input, unidata, newbieToken)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getPagesBySite", variables.characterId])
        queryClient.invalidateQueries(["getPage", variables.characterId])
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
      return Promise.all([
        queryClient.invalidateQueries([
          "checkMint",
          variables.characterId,
          variables.noteId,
          address,
        ]),
        queryClient.invalidateQueries([
          "getMints",
          variables.characterId,
          variables.noteId,
        ]),
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
      characterId,
      noteId,
      content,
      externalUrl,
      originalCharacterId,
      originalNoteId,
    }: {
      characterId: number
      noteId: number
      content: string
      externalUrl: string
      originalCharacterId?: number
      originalNoteId?: number
    }) => {
      return postNoteForNote.mutate(
        {
          note: {
            characterId,
            noteId,
          },
          metadata: {
            content,
            external_urls: [externalUrl],
            tags: ["comment"],
            sources: ["xlog"],
          },
        },
        {
          onSuccess(data, variables) {
            queryClient.invalidateQueries([
              "getComments",
              originalCharacterId || characterId,
              originalNoteId || noteId,
            ])
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

export function useAnonymousComment() {
  const queryClient = useQueryClient()

  return useMutation(
    async (
      payload: Parameters<typeof pageModel.anonymousComment>[0] & {
        originalNoteId?: number
        originalCharacterId?: number
      },
    ) => {
      return pageModel.anonymousComment(payload)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getComments",
          variables.originalCharacterId || variables.targetCharacterId,
          variables.originalNoteId || variables.targetNoteId,
        ])
      },
    },
  )
}

export function useUpdateComment() {
  const queryClient = useQueryClient()
  const contract = useContract()

  return useMutation(
    async (
      payload: Parameters<typeof pageModel.updateComment>[0] & {
        originalNoteId?: number
        originalCharacterId?: number
      },
    ) => {
      return pageModel.updateComment(payload, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getComments",
          variables.originalCharacterId || variables.characterId,
          variables.originalNoteId || variables.noteId,
        ])
      },
    },
  )
}

export function useGetComments(
  input: Partial<Parameters<typeof pageModel.getComments>[0]>,
) {
  return useInfiniteQuery({
    queryKey: ["getComments", input.characterId, input.noteId],
    queryFn: async ({ pageParam }) => {
      if (!input.characterId || !input.noteId) {
        return null
      }
      return pageModel.getComments({
        characterId: input.characterId,
        noteId: input.noteId,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export function useGetMirrorXyz(input: { address?: string }) {
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

    return response?.data?.projectFeed?.posts as {
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

export function useCheckMirror(characterId?: number) {
  return useQuery(["checkMirror", characterId], async () => {
    if (!characterId) {
      return
    }
    return pageModel.checkMirror(characterId)
  })
}

export function useGetImageInfo(src?: string) {
  return useQuery(["getImageInfo", src], async () => {
    if (!src) {
      return
    }
    return (await (await fetch(`/api/image?url=${src}`)).json()) as {
      size: {
        width: number
        height: number
      }
      base64: string
    }
  })
}

export const useReportStats = (
  input: Partial<Parameters<typeof pageModel.reportStats>[0]>,
) => {
  return useQuery(
    ["reportStats", input.characterId, input.noteId],
    async () => {
      if (!input.characterId || !input.noteId) {
        return null
      }
      return pageModel.reportStats({
        characterId: input.characterId,
        noteId: input.noteId,
      })
    },
  )
}

export const useGetDistinctNoteTagsOfCharacter = (characterId?: number) => {
  return useQuery(["getDistinctNoteTagsOfCharacter", characterId], async () => {
    if (!characterId) {
      return {
        list: [],
      }
    }
    return pageModel.getDistinctNoteTagsOfCharacter(characterId)
  })
}
