"use client"

import { useAccountState, useConnectedAction } from "@crossbell/connect-kit"

import { Button } from "~/components/ui/Button"
import { useTranslation } from "~/lib/i18n/client"

export default function ParticipateButton({ tag }: { tag: string }) {
  const { t } = useTranslation("index")

  const handleClick = useConnectedAction(() => {
    const handle =
      useAccountState.getState().computed.account?.character?.handle
    window.open(`/dashboard/${handle}/editor?type=post&tag=${tag}`)
  })

  return (
    <Button className="absolute right-5 top-4" onClick={handleClick}>
      {t("Participate in Topic")}
    </Button>
  )
}
