"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef } from "react"

import {
  useAccountState,
  useConnectModal,
  useWalletMintNewCharacterModal,
} from "@crossbell/connect-kit"

export default function Dashboard() {
  const router = useRouter()
  const walletMintNewCharacterModal = useWalletMintNewCharacterModal()
  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])
  const connectModal = useConnectModal()

  const isConnectModalShown = useRef(false)
  const isMintCharacterModalShown = useRef(false)

  useEffect(() => {
    if (ssrReady) {
      // Wait till SSR is ready
      if (!account) {
        // Wallet not connected
        if (!isConnectModalShown.current) {
          // Not shown
          isConnectModalShown.current = true
          connectModal.show()
        } else if (!connectModal.isActive) {
          // Shown, but closed by user
          router.push("/") // Go back home
        }
      } else {
        // Wallet is connected, wait till site is ready
        // Reset connect wallet status to prevent unexpected redirect
        isConnectModalShown.current = false
        if (!account.character) {
          // No character found, prompt to mint one
          if (!isMintCharacterModalShown.current) {
            // Not shown
            isMintCharacterModalShown.current = true
            walletMintNewCharacterModal.show()
          } else if (!walletMintNewCharacterModal.isActive) {
            // Shown, but closed by user
            router.push("/") // Go back home
          }
        } else {
          // Already have characters, redirect to primary
          router.push(`/dashboard/${account.character.handle}`)
        }
      }
    }
  }, [ssrReady, router, walletMintNewCharacterModal, account, connectModal])

  return null
}
