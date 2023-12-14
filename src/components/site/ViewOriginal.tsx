"use client"

import { useTranslations } from "next-intl"

import { ExpandedNote } from "~/lib/types"

export default function ViewOriginal({ page }: { page: ExpandedNote }) {
  const t = useTranslations()

  return (
    <span
      className="ml-1 underline cursor-pointer"
      onClick={() => {
        document.cookie = `NEXT_LOCALE=${page?.metadata?.content?.translatedFrom};`
        window.location.reload()
      }}
    >
      {t("View Original")}
    </span>
  )
}
