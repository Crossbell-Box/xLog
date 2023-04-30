import {
  useAccountState,
  useFollowCharacter,
  useFollowCharacters,
  useUnfollowCharacter,
} from "@crossbell/connect-kit"
import { useContract } from "@crossbell/contract"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import * as siteModel from "~/models/site.model"

import { useUnidata } from "./unidata"

export const useGetSite = (input?: string) => {
  return useQuery(["getSite", input], async () => {
    if (!input) {
      return null
    }
    return siteModel.getSite(input)
  })
}

export const useGetSubscription = (toCharacterId?: number) => {
  const account = useAccountState((s) => s.computed.account)

  return useQuery(
    ["getSubscription", toCharacterId, account?.characterId],
    async () => {
      if (!account?.characterId || !toCharacterId) {
        return false
      }

      return siteModel.getSubscription({
        characterId: account?.characterId,
        toCharacterId: toCharacterId,
      })
    },
  )
}

export const useGetSiteSubscriptions = (data: { characterId?: number }) => {
  return useInfiniteQuery({
    queryKey: ["getSiteSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return siteModel.getSiteSubscriptions({
        characterId: data.characterId,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export const useGetSiteToSubscriptions = (data: { characterId?: number }) => {
  return useInfiniteQuery({
    queryKey: ["getSiteToSubscriptions", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return siteModel.getSiteToSubscriptions({
        characterId: data.characterId,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage?.cursor || undefined,
  })
}

export function useUpdateSite() {
  const newbieToken = useAccountState((s) => s.email?.token)
  const unidata = useUnidata()
  const queryClient = useQueryClient()
  const mutation = useMutation(
    async (payload: Parameters<typeof siteModel.updateSite>[0]) => {
      return siteModel.updateSite(payload, unidata, newbieToken)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries(["getSite"])
      },
    },
  )
  return mutation
}

export function useSubscribeToSite() {
  const queryClient = useQueryClient()
  const account = useAccountState((s) => s.computed.account)

  return useFollowCharacter({
    onSuccess: (data, variables: any) => {
      return Promise.all([
        queryClient.invalidateQueries([
          "getSiteSubscriptions",
          {
            characterId: variables.characterId,
          },
        ]),

        queryClient.invalidateQueries([
          "getSubscription",
          variables.characterId,
          account?.type === "email"
            ? account?.character?.handle
            : account?.handle,
        ]),
      ])
    },
  })
}

export function useSubscribeToSites() {
  const queryClient = useQueryClient()
  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  return useFollowCharacters({
    onSuccess: (_, variables: any) =>
      Promise.all(
        variables.siteIds.flatMap((characterId: number) => {
          return [
            queryClient.invalidateQueries([
              "getSiteSubscriptions",
              {
                characterId,
              },
            ]),

            queryClient.invalidateQueries([
              "getSubscription",
              characterId,
              currentCharacterId,
            ]),
          ]
        }),
      ),
  })
}

export function useUnsubscribeFromSite() {
  const queryClient = useQueryClient()
  const account = useAccountState((s) => s.computed.account)

  return useUnfollowCharacter({
    onSuccess: (data, variables: any) => {
      return Promise.all([
        queryClient.invalidateQueries([
          "getSiteSubscriptions",
          {
            siteId: variables.characterId,
          },
        ]),
        queryClient.invalidateQueries([
          "getSubscription",
          variables.characterId,
          account?.type === "email"
            ? account?.character?.handle
            : account?.handle,
        ]),
      ])
    },
  })
}

export const useGetCommentsBySite = (
  data: Partial<Parameters<typeof siteModel.getCommentsBySite>[0]>,
) => {
  return useInfiniteQuery({
    queryKey: ["getCommentsBySite", data],
    queryFn: async ({ pageParam }) => {
      if (!data.characterId) {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return siteModel.getCommentsBySite({
        characterId: data.characterId,
        cursor: pageParam,
      })
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const useGetOperators = (
  data: Parameters<typeof siteModel.getOperators>[0],
) => {
  return useQuery(["getOperators", data], async () => {
    if (!data.characterId) {
      return null
    }
    return siteModel.getOperators(data)
  })
}

export const useIsOperators = (
  data: Partial<Parameters<typeof siteModel.isOperators>[0]>,
) => {
  return useQuery(["isOperators", data], async () => {
    if (!data.characterId || !data.operator) {
      return null
    }
    return siteModel.isOperators({
      characterId: data.characterId,
      operator: data.operator,
    })
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

export const useGetNFTs = (address?: string) => {
  return useQuery(["getNFTs", address], async () => {
    if (!address) {
      return null
    }
    return await (
      await fetch(
        "/api/nfts?" +
          new URLSearchParams({
            address,
          } as any),
      )
    ).json()
  })
}

export const useGetStat = (
  data: Partial<Parameters<typeof siteModel.getStat>[0]>,
) => {
  return useQuery(["getStat", data.characterId], async () => {
    if (!data.characterId) {
      return null
    }
    return siteModel.getStat({
      characterId: data.characterId,
    })
  })
}

export function useTipCharacter() {
  const queryClient = useQueryClient()
  const contract = useContract()
  const mutation = useMutation(
    async (payload: Parameters<typeof siteModel.tipCharacter>[0]) => {
      return siteModel.tipCharacter(payload, contract)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getTips",
          {
            toCharacterId: variables.toCharacterId,
          },
        ])
      },
    },
  )
  return mutation
}

export const useGetTips = (
  data: Partial<Parameters<typeof siteModel.getTips>[0]>,
) => {
  const contract = useContract()
  return useInfiniteQuery({
    queryKey: ["getTips", data],
    queryFn: async ({ pageParam }) => {
      if (!data.toCharacterId || data.characterId === "0") {
        return {
          count: 0,
          list: [],
          cursor: undefined,
        }
      }
      return siteModel.getTips(
        {
          ...data,
          toCharacterId: data.toCharacterId,
          cursor: pageParam,
        },
        contract,
      )
    },
    getNextPageParam: (lastPage) => lastPage.cursor || undefined,
  })
}

export const useGetAchievements = (characterId?: number) => {
  return useQuery(["getAchievements", characterId], async () => {
    if (!characterId) {
      return null
    }
    return siteModel.getAchievements(characterId)
  })
}

export const useMintAchievement = () => {
  const queryClient = useQueryClient()
  return useMutation(
    async (input: Parameters<typeof siteModel.mintAchievement>[0]) => {
      return siteModel.mintAchievement(input)
    },
    {
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries([
          "getAchievements",
          variables.characterId,
        ])
      },
    },
  )
}

export const useGetMiraBalance = (characterId?: number) => {
  const contract = useContract()
  return useQuery(["getMiraBalance", characterId], async () => {
    if (!characterId) {
      return {
        data: "Loading...",
      }
    }
    return siteModel.getMiraBalance(characterId, contract)
  })
}

export const useGetGreenfieldId = (cid?: string) => {
  return useQuery(["getGreenfieldId", cid], async () => {
    if (!cid) {
      return null
    }
    return siteModel.getGreenfieldId(cid)
  })
}
