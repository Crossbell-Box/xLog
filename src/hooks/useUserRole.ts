import { useAccountSites } from "~/queries/site"
import { useGetSite, useIsOperators } from "~/queries/site"
import { useAccountState } from "@crossbell/connect-kit"

export function useUserRole(subdomain?: string) {
  const site = useGetSite(subdomain)

  const userSite = useAccountSites()
  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])

  const isOperator = useIsOperators({
    characterId: +(site.data?.metadata?.proof || 0),
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
        if (userSite.data?.find((site) => site.username === subdomain)) {
          role = "owner"
        } else if (isOperator.data) {
          role = "operator"
        }

        return {
          isSuccess:
            site.isSuccess && userSite.isSuccess && isOperator.isSuccess,
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
