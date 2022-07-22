import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as pageModel from "~/models/page.model"
import { PageVisibilityEnum } from "~/lib/types"

export const useGetPagesBySite = (input: Parameters<typeof pageModel.getPagesBySite>[0]) => {
  return useQuery(['getPagesBySite', input.site, input], async () => {
    return pageModel.getPagesBySite(input)
  })
}

export const useGetPage = (input: Parameters<typeof pageModel.getPage>[0]) => {
  return useQuery(['getPage', input.page, input], async () => {
    return pageModel.getPage(input)
  })
}

export function useCreateOrUpdatePage() {
  const queryClient = useQueryClient();
  const mutation = useMutation(async (
    payload: Parameters<typeof pageModel.createOrUpdatePage>[0]) => {
    return pageModel.createOrUpdatePage(payload)
  }, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['getPagesBySite', variables.siteId])
      queryClient.invalidateQueries(['getPage', variables.pageId])
    },
  })
  return mutation
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation(async (input: Parameters<typeof pageModel.deletePage>[0]) => {
    return pageModel.deletePage(input)
  }, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['getPagesBySite', variables.site])
      queryClient.invalidateQueries(['getPage', variables.id])
    },
  })
}
