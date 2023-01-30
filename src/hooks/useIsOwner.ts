import { useAccountBalance as _useAccountBalance } from "@crossbell/connect-kit"
import { useAccountSites } from "~/queries/site"
import { useGetSite, useIsOperators } from "~/queries/site"
import { useAccountState } from "@crossbell/connect-kit"

export function useIsOwner(subdomain?: string) {
  const site = useGetSite(subdomain)

  const userSite = useAccountSites()
  const [address] = useAccountState((s) => [s.computed.account?.address])

  const isOperator = useIsOperators({
    characterId: +(site.data?.metadata?.proof || 0),
    operator: address,
  })

  return {
    isSuccess:
      subdomain &&
      address &&
      site.isSuccess &&
      userSite.isSuccess &&
      isOperator.isSuccess,
    data: !!(
      subdomain &&
      address &&
      (userSite.data?.find((site) => site.username === subdomain) ||
        isOperator.data)
    ),
  }
}
