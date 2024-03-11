"use client"

import { useTranslations } from "next-intl"

import { ExpandedNote } from "~/lib/types"

export default function ViewOriginal({ page }: { page: ExpandedNote }) {
  const t = useTranslations()

  return (
    <span
      className="ml-2 cursor-pointer text-accent font-bold"
      onClick={() => {
        // remove the locale search param
        const url = new URL(window.location.href)
        url.searchParams.delete("locale")
        window.history.replaceState({}, "", url.toString())

        document.cookie = `NEXT_LOCALE=${page?.metadata?.content?.translatedFrom};`
        window.location.reload()
      }}
    >
      {t("View Original")}
    </span>
  )
}
