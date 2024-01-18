import { useTranslations } from "next-intl"

import { cn } from "~/lib/utils"

export default function PostTitle({
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
  const t = useTranslations()

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
