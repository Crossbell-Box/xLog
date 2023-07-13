"use client"

import { useState } from "react"

import { useTranslation } from "~/lib/i18n/client"

export default function ShowMoreContainer({
  children,
}: {
  children: JSX.Element
}) {
  const [showcaseMore, setShowcaseMore] = useState(false)
  const { t } = useTranslation("index")

  return (
    <ul
      className={`overflow-y-clip relative text-left space-y-4 ${
        showcaseMore ? "" : "max-h-[540px]"
      }`}
    >
      <div
        className={`absolute bottom-0 h-14 left-0 right-0 bg-gradient-to-t from-white via-white flex items-end justify-center font-bold cursor-pointer z-[1] text-sm ${
          showcaseMore ? "hidden" : ""
        }`}
        onClick={() => setShowcaseMore(true)}
      >
        {t("Show more")}
      </div>
      {children}
    </ul>
  )
}
