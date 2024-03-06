"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import React from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { Button } from "~/components/ui/Button"

export function EntranceButton() {
  const router = useRouter()
  const t = useTranslations()
  const isConnected = useAccountState((s) => !!s.computed.account)

  return (
    <Button
      className="text-accent h-10 mt-4 flex items-center"
      onClick={() => router.push("/dashboard")}
      size="2xl"
      variantColor="black"
    >
      {isConnected ? (
        <>
          <span className="i-mingcute-grid-line text-xl mr-2 inline-block"></span>
          <span>{t("Dashboard")}</span>
        </>
      ) : (
        <span>{t("Get my xLog in 5 minutes")}</span>
      )}
    </Button>
  )
}
