import { useBalance } from "wagmi"
import {
  useAccountState,
  useAccountBalance as _useAccountBalance,
} from "@crossbell/connect-kit"

export function useAccountBalance(): ReturnType<typeof _useAccountBalance> {
  const account = useAccountState((s) => s.computed.account)
  const walletBalance = useBalance({
    address: account?.address as `0x${string}` | undefined,
  })
  const accountBalance = _useAccountBalance()

  if (account?.type === "email") {
    return accountBalance
  } else {
    return {
      balance: walletBalance.data,
      isLoading: walletBalance.isLoading,
    }
  }
}
