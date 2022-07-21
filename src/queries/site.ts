import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as siteModel from "~/models/site.model"
import { SiteNavigationItem, Profile } from "~/lib/types"

export const useGetUserSites = (address?: string) => {
  return useQuery(['getUserSites', address], async () => {
    if (!address) {
      return []
    }
    return siteModel.getUserSites(address)
  })
}

export const useGetSite = (input: string) => {
  return useQuery(['getSite', input], async () => {
    return siteModel.getSite(input)
  })
}

export function useUpdateSite() {
  const queryClient = useQueryClient();
  const mutation = useMutation(async (
    payload: {
      site: string
      name?: string
      description?: string
      icon?: string | null
      subdomain?: string
      navigation?: SiteNavigationItem[]
    }) => {
    return siteModel.updateSite(payload)
  }, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['getUserSites'])
      queryClient.invalidateQueries(['getSite'])
    },
  })
  return mutation
}

export function useCreateSite() {
  const queryClient = useQueryClient();
  return useMutation(async (input: {
    address: string,
    payload: { name: string; subdomain: string },
  }) => {
    return siteModel.createSite(input.address, input.payload)
  }, {
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['getUserSites', variables.address])
    },
  })
}
