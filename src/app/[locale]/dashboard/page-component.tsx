"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  useAccountState,
  useConnectModal,
  useWalletMintNewCharacterModal,
} from "@crossbell/connect-kit"

export default function Dashboard() {
  const router = useRouter()

  // Hooks for wallet and modal states
  const walletMintModal = useWalletMintNewCharacterModal()
  const connectModal = useConnectModal()

  const [ssrReady, account] = useAccountState(({ ssrReady, computed }) => [
    ssrReady,
    computed.account,
  ])

  // Prevent duplicate modal openings
  const hasShownConnectModal = useRef(false)
  const hasShownMintModal = useRef(false)

  useEffect(() => {
    if (!ssrReady) return // Wait for SSR to be ready

    const handleDisconnected = () => {
      if (!hasShownConnectModal.current) {
        hasShownConnectModal.current = true
        connectModal.show()
      } else if (!connectModal.isActive) {
        router.push("/")
      }
    }

    const handleNoCharacter = () => {
      if (!hasShownMintModal.current) {
        hasShownMintModal.current = true
        walletMintModal.show()
      } else if (!walletMintModal.isActive) {
        router.push("/")
      }
    }

    const handleHasCharacter = () => {
      router.push(`/dashboard/${account.character.handle}`)
    }

    // --- Decision tree ---
    if (!account) {
      handleDisconnected()
    } else {
      hasShownConnectModal.current = false
      if (!account.character) {
        handleNoCharacter()
      } else {
        handleHasCharacter()
      }
    }
  }, [ssrReady, account, connectModal, walletMintModal, router])

  return null
}
