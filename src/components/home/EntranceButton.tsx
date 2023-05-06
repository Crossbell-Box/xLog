"use client"

import { useRouter } from "next/navigation"
import React from "react"

import { useAccountState } from "@crossbell/connect-kit"

import { Button } from "~/components/ui/Button"

interface Props {
  connectedContent: React.ReactNode
  unconnectedContent: React.ReactNode
}

export default function EntranceButton(props: Props) {
  const router = useRouter()
  const isConnected = useAccountState((s) => !!s.computed.account)

  return (
    <Button
      className="text-accent h-10 mt-4 flex items-center"
      onClick={() => router.push("/dashboard")}
      size="2xl"
      variantColor="black"
    >
      {isConnected ? props.connectedContent : props.unconnectedContent}
    </Button>
  )
}
