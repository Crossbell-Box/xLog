import { getLocale, getTranslations } from "next-intl/server"

import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

export default async function TranslationInfo({
  page,
  className,
}: {
  page: ExpandedNote
  className?: string
}) {
  const t = await getTranslations()
  const locale = await getLocale()

  if (
    page.metadata?.content?.translatedTo &&
    page.metadata?.content?.translatedFrom &&
    locale !== page.metadata?.content?.translatedFrom
  ) {
    return (
      <div
        className={cn(
          "text-zinc-400 mt-5 space-x-5 flex justify-center",
          className,
        )}
      >
        <span className="xlog-post-views inline-flex items-center">
          <i className="icon-[mingcute--translate-2-line] mr-[2px]" />
          <span>
            {t.rich("Translated by", {
              from: () => (
                <span>{t(page.metadata.content.translatedFrom)}</span>
              ),
              to: () => <span>{t(page.metadata.content.translatedTo)}</span>,
            })}
          </span>
        </span>
      </div>
    )
  }

  return null
}
