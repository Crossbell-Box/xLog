import { useRouter } from "next/router"
import { useEffect } from "react"

import {
  useAccountState,
  useConnectModal,
  useWalletMintNewCharacterModal,
} from "@crossbell/connect-kit"

import { useAccountSites } from "~/queries/site"

export default function Dashboard() {
  const router = useRouter()
  const userSites = useAccountSites()
  const walletMintNewCharacterModal = useWalletMintNewCharacterModal()
  const [ssrReady, isConnected] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    !!computed.account,
  ])
  const connectModal = useConnectModal()

  useEffect(() => {
    if (ssrReady) {
      if (!isConnected) {
        connectModal.show()
      } else if (userSites.isSuccess) {
        if (!userSites.data?.length) {
          walletMintNewCharacterModal.show()
        } else {
          router.push(`/dashboard/${userSites.data[0].username}`)
        }
      }
    }
  }, [
    ssrReady,
    userSites,
    router,
    walletMintNewCharacterModal,
    isConnected,
    connectModal,
  ])

  return (
    <div className="flex items-center justify-center w-full h-60">
      Loading...
    </div>
  )
}
