"use client"

import { useEffect, useState } from "react"

import { useDate } from "~/hooks/useDate"

export const Time = ({ isoString }: { isoString?: string }) => {
  const date = useDate()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isoString) {
    return null
  }

  return (
    <time
      dateTime={date.formatToISO(isoString || "")}
      className="xlog-post-date whitespace-nowrap"
    >
      {date.formatDate(
        isoString || "",
        undefined,
        isMounted ? undefined : "America/Los_Angeles",
      )}
    </time>
  )
}
