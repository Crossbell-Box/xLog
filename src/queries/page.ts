import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as pageModel from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export const useGetPagesBySite = (
  input: Parameters<typeof pageModel.getPagesBySite>[0],
) => {
  return useQuery(["getPagesBySite", input.site, input], async () => {
    return pageModel.getPagesBySite(input)
  })
}

export const useGetPage = (input: Parameters<typeof pageModel.getPage>[0]) => {
  return useQuery(["getPage", input.page, input], async () => {
    return pageModel.getPage(input)
  })
}

export const useGetLikes = (input: { pageId?: string }) => {
  return useQuery(["getLikes", input.pageId], async () => {
    if (!input.pageId) {
      return {
        count: 0,
        list: [],
      }
    }
    return pageModel.getLikes({
      pageId: input.pageId,
    })
  })
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

export const useGetMints = (input: { pageId?: string }) => {
  return useQuery(["getMints", input.pageId], async () => {
    if (!input.pageId) {
      return {
        count: 0,
        list: [],
      }
    }
    return pageModel.getMints({
      pageId: input.pageId,
    })
  })
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
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof pageModel.createOrUpdatePage>[0]) => {
      return pageModel.createOrUpdatePage(payload)
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
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.deletePage>[0]) => {
      return pageModel.deletePage(input)
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
  return useMutation(
    async (input: Parameters<typeof pageModel.likePage>[0]) => {
      return pageModel.likePage(input)
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
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.unlikePage>[0]) => {
      return pageModel.unlikePage(input)
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
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.mintPage>[0]) => {
      return pageModel.mintPage(input)
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
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof pageModel.commentPage>[0]) => {
      return pageModel.commentPage(input)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getComments", variables.pageId])
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
