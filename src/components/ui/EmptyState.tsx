"use client"

import { useTranslation } from "~/lib/i18n/client"

export const EmptyState = ({ resource = "post" }: { resource?: string }) => {
  const { t } = useTranslation("common")

  return (
    <div className="text-center py-10 mb-10 text-2xl text-zinc-300 font-medium flex justify-center flex-col items-center">
      <span className="icon-[mingcute--ghost-line] text-5xl mb-2"></span>
      <div className="capitalize">
        {" "}
        {t(`No ${resource.charAt(0).toUpperCase() + resource.slice(1)} Yet`)}
      </div>
    </div>
  )
}
