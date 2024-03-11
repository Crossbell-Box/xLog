import { getLocale, getTranslations } from "next-intl/server"

import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

import ViewOriginal from "./ViewOriginal"

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
      <div className={cn("mt-5 border rounded-xl p-4 space-y-2", className)}>
        <div className="font-bold text-zinc-700 flex items-center">
          <i className="i-mingcute-sparkles-line mr-2 text-lg" />
          {t("AI Translation")}
        </div>
        <div className="text-zinc-500 leading-loose text-sm">
          <span>
            {t.rich("Translated by", {
              from: () => (
                <span>{t(page.metadata.content.translatedFrom)}</span>
              ),
              to: () => <span>{t(page.metadata.content.translatedTo)}</span>,
            })}
          </span>
          <ViewOriginal page={page} />
        </div>
      </div>
    )
  }

  return null
}
