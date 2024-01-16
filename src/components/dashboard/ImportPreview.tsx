import type { NoteMetadata } from "crossbell"
import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { useState } from "react"

import { useDate } from "~/hooks/useDate"
import { RESERVED_TAGS } from "~/lib/constants"
import { cn } from "~/lib/utils"

const DynamicMarkdownContent = dynamic(
  () => import("../common/MarkdownContent"),
  {
    ssr: false,
  },
)

export const ImportPreview = ({ note }: { note: NoteMetadata }) => {
  const date = useDate()
  const [showcaseMore, setShowcaseMore] = useState(false)
  const t = useTranslations()

  return (
    <article className="border rounded-xl p-6 mt-4">
      <div>
        <h2 className="xlog-post-title text-3xl font-bold">{note.title}</h2>
      </div>
      <div className="text-zinc-400 mt-4 space-x-5 flex items-center">
        <time
          dateTime={date.formatToISO(note.date_published!)}
          className="xlog-post-date whitespace-nowrap"
        >
          {date.formatDate(note.date_published!, undefined)}
        </time>
        {!!note.tags?.filter((tag) => !RESERVED_TAGS.includes(tag)).length && (
          <span className="xlog-post-tags space-x-1 truncate min-w-0">
            {note.tags
              ?.filter((tag) => !RESERVED_TAGS.includes(tag))
              .map((tag) => (
                <span className="hover:text-zinc-600" key={tag}>
                  #{tag}
                </span>
              ))}
          </span>
        )}
      </div>
      <div
        className={`overflow-y-hidden relative ${
          showcaseMore ? "" : "max-h-[200px]"
        }`}
      >
        <div
          className={cn(
            "absolute bottom-0 h-20 inset-x-0 bg-gradient-to-t from-white via-white z-40 flex items-end justify-center font-bold cursor-pointer",
            showcaseMore && "hidden",
          )}
          onClick={() => setShowcaseMore(true)}
        >
          {t("Show more")}
        </div>
        <DynamicMarkdownContent
          className="mt-4"
          content={note?.content}
        ></DynamicMarkdownContent>
      </div>
    </article>
  )
}
