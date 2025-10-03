"use client"

import { useTranslations } from "next-intl"

import { useWalletClaimCSBModal } from "@crossbell/connect-kit"

import { Button } from "~/components/ui/Button"

export function ClaimCSBButton() {
  const t = useTranslations()
  const claimCSBModal = useWalletClaimCSBModal()
  return (
    <Button
      onClick={() => claimCSBModal.show()}
      aria-label="claim csb"
      isAutoWidth
    >
      ⛽ {t("Claim CSB")}
    </Button>
  )
}
