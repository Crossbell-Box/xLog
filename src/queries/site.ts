import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import * as siteModel from "~/models/site.model"
import { useUnidata } from "./unidata"
import { useContract } from "./crossbell"

export const useGetUserSites = (address?: string) => {
  const unidata = useUnidata()
  return useQuery(["getUserSites", address], async () => {
    if (!address) {
      return []
    }
    return siteModel.getUserSites(address, unidata)
  })
}

export const useGetSite = (input: string) => {
  const unidata = useUnidata()
  return useQuery(["getSite", input], async () => {
    if (!input) {
      return null
    }
    return siteModel.getSite(input, unidata)
  })
}

export const useGetSites = (input: string[]) => {
  return useQuery(["getSites", input], async () => {
    if (!input) {
      return null
    }
    return siteModel.getSites(input)
  })
}

export const useGetSubscription = (data: {
  userId: string
  siteId: string
}) => {
  const unidata = useUnidata()
  return useQuery(["getSubscription", data], async () => {
    if (!data.userId || !data.siteId) {
      return false
    }
    return siteModel.getSubscription(data, unidata)
  })
}

export const useGetSiteSubscriptions = (data: { siteId: string }) => {
  const unidata = useUnidata()
  return useQuery(["getSiteSubscriptions", data], async () => {
    if (!data.siteId) {
      return null
    }
    return siteModel.getSiteSubscriptions(data, unidata)
  })
}

export const useGetSiteToSubscriptions = (data: { siteId: string }) => {
  const unidata = useUnidata()
  return useQuery(["getSiteToSubscriptions", data], async () => {
    if (!data.siteId) {
      return null
    }
    return siteModel.getSiteToSubscriptions(data, unidata)
  })
}

export function useUpdateSite() {
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof siteModel.updateSite>[0]) => {
      return siteModel.updateSite(payload, unidata)
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
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: {
      address: string
      payload: { name: string; subdomain: string }
    }) => {
      return siteModel.createSite(input.address, input.payload, unidata)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getUserSites", variables.address])
      },
    },
  )
}

export function useSubscribeToSite() {
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.subscribeToSite>[0]) => {
      return siteModel.subscribeToSite(input, unidata)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "useGetSiteSubscriptions",
          {
            siteId: variables.siteId,
          },
        ])
        queryClient.invalidateQueries(["getSubscription", variables])
      },
    },
  )
}

export function useSubscribeToSites() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.subscribeToSites>[0]) => {
      return siteModel.subscribeToSites(input, contract)
    },
    {
      onSuccess: (data, variables) => {
        variables.sites.forEach((site) => {
          queryClient.invalidateQueries([
            "useGetSiteSubscriptions",
            {
              siteId: site.characterId,
            },
          ])
          queryClient.invalidateQueries([
            "getSubscription",
            {
              userId: variables.user.metadata?.proof,
              siteId: site.characterId,
            },
          ])
        })
      },
    },
  )
}

export function useUnsubscribeFromSite() {
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.subscribeToSite>[0]) => {
      return siteModel.unsubscribeFromSite(input, unidata)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "useGetSiteSubscriptions",
          {
            siteId: variables.siteId,
          },
        ])
        queryClient.invalidateQueries(["getSubscription", variables])
      },
    },
  )
}

export const useGetNotifications = (data: { siteCId?: string }) => {
  return useQuery(["getNotifications", data], async () => {
    if (!data.siteCId) {
      return null
    }
    return siteModel.getNotifications({
      siteCId: data.siteCId,
    })
  })
}

export const useGetOperators = (
  data: Parameters<typeof siteModel.getOperators>[0],
) => {
  const contract = useContract()
  return useQuery(["getOperators", data], async () => {
    if (!data.characterId) {
      return null
    }
    return (await siteModel.getOperators(data, contract))?.data?.filter(
      (operator) => operator !== "0x0000000000000000000000000000000000000000",
    )
  })
}

export const useIsOperators = (
  data: Partial<Parameters<typeof siteModel.isOperators>[0]>,
) => {
  const contract = useContract()
  return useQuery(["isOperators", data], async () => {
    if (!data.characterId || !data.operator) {
      return null
    }
    return siteModel.isOperators(
      {
        characterId: data.characterId,
        operator: data.operator,
      },
      contract,
    )
  })
}

export function useAddOperator() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.addOperator>[0]) => {
      return siteModel.addOperator(input, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getOperators",
          {
            characterId: variables.characterId,
          },
        ])
        queryClient.invalidateQueries(["isOperators", variables])
      },
    },
  )
}

export function useRemoveOperator() {
  const contract = useContract()
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Partial<Parameters<typeof siteModel.removeOperator>[0]>) => {
      if (!input.operator || !input.characterId) {
        return null
      }
      return siteModel.removeOperator(
        {
          operator: input.operator,
          characterId: input.characterId,
        },
        contract,
      )
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getOperators",
          {
            characterId: variables.characterId,
          },
        ])
        queryClient.invalidateQueries(["isOperators", variables])
      },
    },
  )
}
