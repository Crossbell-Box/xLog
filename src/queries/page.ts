"use client"

import type { NoteEntity } from "crossbell"

import {
  useAccountState,
  useCharacterAttribute,
  useDeleteNote,
  useIsNoteLiked,
  useMintNote,
  useNoteLikeCount,
  useNoteLikeList,
  usePostNote,
  usePostNoteForNote,
  useToggleLikeNote,
  useUpdateNote,
} from "@crossbell/connect-kit"
import { useContract } from "@crossbell/contract"
import { useRefCallback } from "@crossbell/util-hooks"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { editor2Crossbell } from "~/lib/editor-converter"
import createSearchParams from "~/lib/search-params"
import { EditorValues, NoteType } from "~/lib/types"
import * as pageModel from "~/models/page.model"

export const useGetPagesBySiteLite = (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  return useInfiniteQuery({
    queryKey: ["getPagesBySite", input.characterId, input],
    queryFn: async ({ pageParam }) => {
      const result: ReturnType<typeof pageModel.getPagesBySite> = await (
        await fetch(
          "/api/pages?" +
            createSearchParams({
              ...input,
              ...(pageParam && { cursor: pageParam }),
            }),
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
      disableAutofill: input.disableAutofill,
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

export function useCreatePage() {
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...postNote } = usePostNote()

  const mutate = useRefCallback(
    (
      input: {
        characterId?: number
        type?: NoteType
      } & EditorValues,
    ) => {
      if (!input.characterId) {
        throw new Error("characterId is required")
      }

      return postNote.mutate(
        {
          characterId: input.characterId,
          metadata: editor2Crossbell({
            values: input,
            autofill: true,
            type: input.type || "post",
          }).metadata.content,
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getPagesBySite", input.characterId])
            queryClient.invalidateQueries(["getPage", input.characterId])
          },
        },
      )
    },
  )

  return {
    ...postNote,
    mutate,
  }
}

export function useUpdatePage() {
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...updateNote } = useUpdateNote()

  const mutate = useRefCallback(
    (
      input: {
        noteId?: number
        characterId?: number
        type?: NoteType
      } & EditorValues,
    ) => {
      if (!input.characterId || !input.noteId) {
        throw new Error("characterId and noteId are required")
      }

      return updateNote.mutate(
        {
          note: {
            characterId: input.characterId,
            noteId: input.noteId,
          },
          edit(metadataDraft) {
            metadataDraft.type = "note"
            if (input.title !== undefined) {
              metadataDraft.title = input.title
            }
            if (input.content !== undefined) {
              metadataDraft.content = input.content
            }
            if (input.publishedAt !== undefined) {
              metadataDraft.date_published = input.publishedAt
            }
            if (input.excerpt !== undefined) {
              ;(metadataDraft as any).summary = input.excerpt
            }

            if (!metadataDraft.tags) {
              metadataDraft.tags = []
            }
            if (input.type !== undefined) {
              metadataDraft.tags[0] = input.type
            }
            if (input.tags !== undefined) {
              metadataDraft.tags = [
                metadataDraft.tags[0],
                ...input.tags
                  .split(",")
                  .map((tag) => tag.trim())
                  .filter((tag) => tag),
              ]
            }

            if (input.slug !== undefined) {
              const slug = metadataDraft.attributes?.find(
                (attr) => attr.trait_type === "xlog_slug",
              )
              if (slug) {
                slug.value = input.slug
              } else {
                if (!metadataDraft.attributes) {
                  metadataDraft.attributes = []
                }
                metadataDraft.attributes.push({
                  trait_type: "xlog_slug",
                  value: input.slug,
                })
              }
            }

            if (input.disableAISummary !== undefined) {
              const disableAISummary = metadataDraft.attributes?.find(
                (attr) => attr.trait_type === "xlog_disable_ai_summary",
              )
              if (disableAISummary) {
                disableAISummary.value = input.disableAISummary
              } else {
                if (!metadataDraft.attributes) {
                  metadataDraft.attributes = []
                }
                metadataDraft.attributes.push({
                  trait_type: "xlog_disable_ai_summary",
                  value: input.disableAISummary,
                })
              }
            }

            if (input.cover?.address !== undefined) {
              const cover = metadataDraft.attachments?.find(
                (attr) => attr.name === "cover",
              )
              if (cover) {
                cover.address = input.cover.address
                cover.mime_type = input.cover.mime_type
              } else {
                if (!metadataDraft.attachments) {
                  metadataDraft.attachments = []
                }
                metadataDraft.attachments?.push({
                  name: "cover",
                  address: input.cover.address,
                  mime_type: input.cover.mime_type,
                })
              }
            }

            if (input.images?.length) {
              if (!metadataDraft.attachments) {
                metadataDraft.attachments = []
              }
              metadataDraft.attachments = metadataDraft.attachments
                ?.filter((attr) => attr.name !== "image")
                .concat(
                  input.images?.map((image) => ({
                    name: "image",
                    address: image.address,
                    mime_type: image.mime_type,
                  })),
                )
            }

            if (input.externalUrl) {
              if (!metadataDraft.external_urls) {
                metadataDraft.external_urls = []
              }
              metadataDraft.external_urls[0] = input.externalUrl
            }
          },
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getPagesBySite", input.characterId])
            queryClient.invalidateQueries(["getPage", input.characterId])
          },
        },
      )
    },
  )

  return {
    ...updateNote,
    mutate,
  }
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
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...deleteNote } = useDeleteNote()

  const mutate = useRefCallback(
    (input: { noteId?: number; characterId?: number }) => {
      if (!input.characterId || !input.noteId) {
        throw new Error("characterId and noteId are required")
      }

      return deleteNote.mutate(
        {
          characterId: input.characterId,
          noteId: input.noteId,
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries([
              "getPagesBySite",
              variables.characterId,
            ])
            queryClient.invalidateQueries(["getPage", variables.characterId])
          },
        },
      )
    },
  )

  return {
    ...deleteNote,
    mutate,
  }
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
      originalCharacterId,
      originalNoteId,
    }: {
      characterId: number
      noteId: number
      content: string
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

export const usePinPage = ({
  characterId,
  noteId,
}: Pick<NoteEntity, "noteId" | "characterId">) => {
  const queryClient = useQueryClient()
  const { data, isLoading, update } = useCharacterAttribute<number>(
    {
      characterId,
      key: pageModel.PINNED_PAGE_KEY,
    },
    {
      onSuccess() {
        return queryClient.invalidateQueries(["getPagesBySite", characterId])
      },
    },
  )

  const isPinned = data === noteId

  const togglePin = useRefCallback(() => {
    if (isPinned) {
      update(null)
    } else {
      update(noteId)
    }
  })

  return { isLoading, isPinned, togglePin }
}

export const usePinnedPage = ({
  characterId,
}: Pick<Partial<NoteEntity>, "characterId">) => {
  const { data, isLoading } = useCharacterAttribute({
    characterId,
    key: pageModel.PINNED_PAGE_KEY,
  })

  return { isLoading, noteId: data as number }
}

export const useCalendar = (characterId?: number) => {
  return useQuery(["getCalendar", characterId], async () => {
    if (!characterId) {
      return
    }
    return pageModel.getCalendar(characterId)
  })
}
