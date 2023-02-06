import { useAccountBalance as _useAccountBalance } from "@crossbell/connect-kit"
import { useAccountSites } from "~/queries/site"
import { useGetSite, useIsOperators } from "~/queries/site"
import { useAccountState } from "@crossbell/connect-kit"

export function useUserRole(subdomain?: string) {
  const site = useGetSite(subdomain)

  const userSite = useAccountSites()
  const [ssrReady, address] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account?.address,
  ])

  const isOperator = useIsOperators({
    characterId: +(site.data?.metadata?.proof || 0),
    operator: address,
  })

  let role = null
  if (subdomain) {
    if (address) {
      if (userSite.data?.find((site) => site.username === subdomain)) {
        role = "owner"
      } else if (isOperator.data) {
        role = "operator"
      }

      return {
        isSuccess: site.isSuccess && userSite.isSuccess && isOperator.isSuccess,
        data: role,
      }
    } else {
      return {
        isSuccess: ssrReady,
        data: null,
      }
    }
  } else {
    return {
      isSuccess: false,
      data: null,
    }
  }
}
