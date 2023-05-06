"use client"

import { useRouter } from "next/navigation"

import { useAccountState } from "@crossbell/connect-kit"

import { Button } from "~/components/ui/Button"

export default function EntranceButton() {
  const router = useRouter()
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
          <span className="icon-[mingcute--grid-line] text-xl mr-2 inline-block"></span>
          {/* <span>{t("Dashboard")}</span> */}
          Dashboard
        </>
      ) : (
        // t("Get my xLog in 5 minutes")
        <>Get my xLog in 5 minutes</>
      )}
    </Button>
  )
}
