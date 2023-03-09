import { useEffect, useRef, useState } from "react"
import useOnClickOutside from "use-onclickoutside"
import type { NoteMetadata } from "crossbell.js"
import { PageContent } from "../common/PageContent"
import { useDate } from "~/hooks/useDate"

import { Button, ButtonGroup } from "../ui/Button"
import { useTranslation } from "next-i18next"

export const ImportPreview: React.FC<{
  note: NoteMetadata
}> = ({ note }) => {
  const date = useDate()
  const [showcaseMore, setShowcaseMore] = useState(false)
  const { t } = useTranslation("common")

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
        {!!note.tags?.filter((tag) => tag !== "post" && tag !== "page")
          .length && (
          <span className="xlog-post-tags space-x-1 truncate min-w-0">
            {note.tags
              ?.filter((tag) => tag !== "post" && tag !== "page")
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
          className={`absolute bottom-0 h-20 left-0 right-0 bg-gradient-to-t from-white via-white z-40 flex items-end justify-center font-bold cursor-pointer ${
            showcaseMore ? "hidden" : ""
          }`}
          onClick={() => setShowcaseMore(true)}
        >
          {t("Show more")}
        </div>
        <PageContent className="mt-4" content={note?.content}></PageContent>
      </div>
    </article>
  )
}
