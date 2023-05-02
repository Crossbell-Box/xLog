import { useAccountState } from "@crossbell/connect-kit"

import { useGetSite, useIsOperators } from "~/queries/site"

export function useUserRole(subdomain?: string) {
  const site = useGetSite(subdomain)

  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])

  const isOperator = useIsOperators({
    characterId: site.data?.characterId,
    operator: account?.address,
  })

  let role = null
  if (subdomain) {
    if (account?.type === "email") {
      return {
        isSuccess: ssrReady,
        data: account.character?.handle === subdomain ? "owner" : null,
      }
    } else {
      if (account?.address) {
        if (account.character?.handle === subdomain) {
          role = "owner"
        } else if (isOperator.data) {
          role = "operator"
        }

        return {
          isSuccess: site.isSuccess && ssrReady,
          data: role,
        }
      } else {
        return {
          isSuccess: ssrReady,
          data: null,
        }
      }
    }
  } else {
    return {
      isSuccess: false,
      data: null,
    }
  }
}
