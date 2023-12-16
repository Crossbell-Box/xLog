"use client"

import { useTranslations } from "next-intl"

import { usePatronModal } from "~/components/common/PatronModal"
import { Button } from "~/components/ui/Button"
import { ExpandedCharacter } from "~/lib/types"
import { cn } from "~/lib/utils"

export const PatronButton = ({
  site,
  className,
  size,
  loadingStatusChange,
}: {
  site?: ExpandedCharacter
  className?: string
  size?: "sm" | "xl"
  loadingStatusChange?: (status: boolean) => void
}) => {
  const t = useTranslations()

  const presentPatronModal = usePatronModal()

  return (
    <>
      <Button
        variant="text"
        aria-label={"Patron"}
        key={t("Patron")}
        className={cn(className, "-mx-3 sm:mx-0 text-red-400")}
        onClick={() => presentPatronModal(site)}
      >
        <span className="inline-flex items-center">
          <i className="text-red-400 text-xl inline-flex items-center">
            <i className="i-mingcute-heart-fill inline-block" />
          </i>
          <span className="text-zinc-500 ml-1">{t("Patron")}</span>
        </span>
      </Button>
    </>
  )
}
