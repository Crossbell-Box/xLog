import { getTranslations } from "next-intl/server"

import { cn } from "~/lib/utils"

export default async function PostTitle({
  icon,
  title,
  className,
  center,
  skipTranslate,
}: {
  icon?: React.ReactNode
  title?: string
  className?: string
  center?: boolean
  skipTranslate?: boolean
}) {
  const t = await getTranslations()

  return (
    <h2
      className={cn(
        "xlog-post-title mb-8 flex items-center relative text-4xl font-extrabold",
        {
          "justify-center": center,
          "text-center": center,
        },
        className,
      )}
    >
      {icon}
      <span>{skipTranslate ? title : t(title)}</span>
    </h2>
  )
}
