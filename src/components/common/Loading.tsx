import { useTranslations } from "next-intl"

import { cn } from "~/lib/utils"

export const Loading = ({
  className,
}: {
  className?: string
  context?: unknown
}) => {
  const t = useTranslations()
  return (
    <div
      className={cn(
        "flex gap-2 justify-center items-center w-full my-6",
        className,
      )}
    >
      <div className="i-mingcute-loading-3-fill animate-spin text-xl"></div>
      {t("Loading")}...
    </div>
  )
}
