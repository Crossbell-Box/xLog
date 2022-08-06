import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as siteModel from "~/models/site.model"
import { SiteNavigationItem, Profile } from "~/lib/types"

export const useGetUserSites = (address?: string) => {
  return useQuery(["getUserSites", address], async () => {
    if (!address) {
      return []
    }
    return siteModel.getUserSites(address)
  })
}

export const useGetSite = (input: string) => {
  return useQuery(["getSite", input], async () => {
    return siteModel.getSite(input)
  })
}

export const useGetSubscription = (data: {
  userId: string
  siteId: string
}) => {
  return useQuery(["getSubscription", data], async () => {
    if (!data.userId || !data.siteId) {
      return false
    }
    return siteModel.getSubscription(data)
  })
}

export function useUpdateSite() {
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof siteModel.updateSite>[0]) => {
      return siteModel.updateSite(payload)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getUserSites"])
        queryClient.invalidateQueries(["getSite"])
      },
    },
  )
  return mutation
}

export function useCreateSite() {
  const queryClient = useQueryClient()
  return useMutation(
    async (input: {
      address: string
      payload: { name: string; subdomain: string }
    }) => {
      return siteModel.createSite(input.address, input.payload)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getUserSites", variables.address])
      },
    },
  )
}

export function useSubscribeToSite() {
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.subscribeToSite>[0]) => {
      return siteModel.subscribeToSite(input)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getSubscription", variables])
      },
    },
  )
}

export function useUnsubscribeFromSite() {
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.subscribeToSite>[0]) => {
      return siteModel.unsubscribeFromSite(input)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getSubscription", variables])
      },
    },
  )
}
