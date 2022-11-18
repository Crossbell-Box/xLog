import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query"
import * as pageModel from "~/models/page.model"
import { useUnidata } from "./unidata"
import { useContract } from "./crossbell"

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
    getNextPageParam: (lastPage) => lastPage.cursor,
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
    getNextPageParam: (lastPage) => lastPage.cursor,
  })
}

export const useGetPage = (input: Parameters<typeof pageModel.getPage>[0]) => {
  const unidata = useUnidata()
  return useQuery(["getPage", input.page, input], async () => {
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

export const useCheckLike = (input: { address?: string; pageId?: string }) => {
  return useQuery(["checkLike", input.pageId, input.address], async () => {
    if (!input.pageId || !input.address) {
      return {
        count: 0,
        list: [],
      }
    }
    return pageModel.checkLike({
      address: input.address,
      pageId: input.pageId,
    })
  })
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

export const useCheckMint = (input: { address?: string; pageId?: string }) => {
  return useQuery(["checkMint", input.pageId, input.address], async () => {
    if (!input.pageId || !input.address) {
      return {
        count: 0,
        list: [],
      }
    }
    return pageModel.checkMint({
      address: input.address,
      pageId: input.pageId,
    })
  })
}

export function useCreateOrUpdatePage() {
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof pageModel.createOrUpdatePage>[0]) => {
      return pageModel.createOrUpdatePage(payload, unidata)
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
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.deletePage>[0]) => {
      return pageModel.deletePage(input, unidata)
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
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.likePage>[0]) => {
      return pageModel.likePage(input, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "checkLike",
          variables.pageId,
          variables.address,
        ])
        queryClient.invalidateQueries(["getLikes", variables.pageId])
      },
    },
  )
}

export function useUnlikePage() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.unlikePage>[0]) => {
      return pageModel.unlikePage(input, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "checkLike",
          variables.pageId,
          variables.address,
        ])
        queryClient.invalidateQueries(["getLikes", variables.pageId])
      },
    },
  )
}

export function useMintPage() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.mintPage>[0]) => {
      return pageModel.mintPage(input, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "checkMint",
          variables.pageId,
          variables.address,
        ])
        queryClient.invalidateQueries(["getMints", variables.pageId])
      },
    },
  )
}

export function useCommentPage() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (
      input: Parameters<typeof pageModel.commentPage>[0] & {
        originalId?: string
      },
    ) => {
      return pageModel.commentPage(input, contract)
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
  return useQuery(["getComments", input.pageId], async () => {
    if (!input.pageId) {
      return
    }
    return pageModel.getComments({
      pageId: input.pageId,
    })
  })
}
