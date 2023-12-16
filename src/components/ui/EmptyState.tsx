"use client"

import { useTranslations } from "next-intl"

export const EmptyState = ({ resource = "post" }: { resource?: string }) => {
  const t = useTranslations()

  return (
    <div className="text-center py-10 mb-10 text-2xl text-zinc-300 font-medium flex justify-center flex-col items-center">
      <span className="i-mingcute-ghost-line text-5xl mb-2"></span>
      <div className="capitalize">
        {" "}
        {t(`No ${resource.charAt(0).toUpperCase() + resource.slice(1)} Yet`)}
      </div>
    </div>
  )
}
