"use client"

import {
  useAccountState,
  useFollowCharacter,
  useFollowCharacters,
  useTip,
  useUnfollowCharacter,
  useUpdateCharacterHandle,
  useUpdateCharacterMetadata,
} from "@crossbell/connect-kit"
import { useContract } from "@crossbell/contract"
import { useRefCallback } from "@crossbell/util-hooks"
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { SiteNavigationItem } from "~/lib/types"
import * as siteModel from "~/models/site.model"

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

export function useUpdateHandle() {
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...updateCharacterHandle } =
    useUpdateCharacterHandle()

  const mutate = useRefCallback(
    (input: { characterId?: number; handle?: string }) => {
      if (!input.characterId || !input.handle) {
        throw new Error("characterId and handle are required")
      }

      return updateCharacterHandle.mutate(
        {
          characterId: input.characterId,
          handle: input.handle,
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getSite"])
          },
        },
      )
    },
  )

  return {
    ...updateCharacterHandle,
    mutate,
  }
}

export function useUpdateSite() {
  const queryClient = useQueryClient()
  const { mutateAsync: _, ...updateCharacterMetadata } =
    useUpdateCharacterMetadata()

  const mutate = useRefCallback(
    (input: {
      characterId?: number
      name?: string
      site_name?: string
      description?: string
      footer?: string
      icon?: string
      navigation?: SiteNavigationItem[]
      css?: string
      ga?: string
      ua?: string
      uh?: string
      custom_domain?: string
      // null means remove
      banner?: {
        address: string
        mime_type: string
      } | null
      connected_accounts?: {
        identity: string
        platform: string
        url?: string | undefined
      }[]
      code_theme?: {
        light?: string
        dark?: string
      }
      follow?: {
        feed_id?: string
        user_id?: string
      }
    }) => {
      if (!input.characterId) {
        throw new Error("characterId are required")
      }

      return updateCharacterMetadata.mutate(
        {
          characterId: input.characterId,
          edit(metadataDraft) {
            if (input.name !== undefined) {
              metadataDraft.name = input.name
            }
            if (input.description !== undefined) {
              metadataDraft.bio = input.description
            }
            if (input.icon !== undefined) {
              metadataDraft.avatars = [input.icon]
            }
            if (input.banner !== undefined) {
              metadataDraft.banners = input.banner ? [input.banner] : []
            }
            if (input.connected_accounts !== undefined) {
              metadataDraft.connected_accounts = input.connected_accounts.map(
                (account) => {
                  if (account.identity && account.platform) {
                    return `csb://account:${
                      account.identity
                    }@${account.platform.toLowerCase()}`
                  } else if (typeof account === "string") {
                    return account
                  } else {
                    return ""
                  }
                },
              )
            }

            // attributes
            const setAttribute = (
              inputKey: keyof typeof input,
              typeKey: string,
              needStringify: boolean = false,
            ) => {
              if (input[inputKey] !== undefined) {
                // Initialize attributes
                const newAttribute: {
                  trait_type: string
                  value: any
                } = {
                  trait_type: `xlog_${typeKey}`,
                  value: needStringify
                    ? JSON.stringify(input[inputKey])
                    : input[inputKey],
                }
                if (!metadataDraft.attributes) {
                  metadataDraft.attributes = [newAttribute]
                } else {
                  const oldAttribute = metadataDraft.attributes.find(
                    (attr) => attr.trait_type === newAttribute.trait_type,
                  )
                  if (oldAttribute) {
                    oldAttribute.value = newAttribute.value
                  } else {
                    metadataDraft.attributes.push(newAttribute)
                  }
                }
              }
            }
            setAttribute("navigation", "navigation", true)
            setAttribute("code_theme", "code_theme", true)
            setAttribute("follow", "follow", true)
            setAttribute("css", "css")
            setAttribute("ga", "ga")
            setAttribute("ua", "ua")
            setAttribute("uh", "uh")
            setAttribute("custom_domain", "custom_domain")
            setAttribute("site_name", "site_name")
            setAttribute("footer", "footer")
          },
        },
        {
          onSuccess: (data, variables) => {
            queryClient.invalidateQueries(["getSite"])
          },
        },
      )
    },
  )

  return {
    ...updateCharacterMetadata,
    mutate,
  }
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
          account?.characterId,
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
          account?.characterId,
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

  return useTip({
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries([
        "getTips",
        { toCharacterId: variables.characterId },
      ])
    },
  })
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

export const useGetCharacterCard = ({
  siteId,
  address,
  enabled,
}: {
  siteId?: string
  address?: string
  enabled: boolean
}) => {
  return useQuery(
    ["useGetCharacterCard", { siteId, address }],
    async () => {
      if (siteId) {
        return siteModel.getSite(siteId)
      } else if (address) {
        return siteModel.getSiteByAddress(address)
      } else {
        return null
      }
    },
    {
      enabled,
    },
  )
}

export const useGetBlockNumber = () => {
  return useQuery(["getBlockNumber"], async () => {
    return siteModel.getBlockNumber()
  })
}
