import dayjs from "dayjs"

import "dayjs/locale/en"
import "dayjs/locale/ja"
import "dayjs/locale/zh"
import "dayjs/locale/zh-tw"

import duration from "dayjs/plugin/duration"
import localizedFormat from "dayjs/plugin/localizedFormat"
import relativeTime from "dayjs/plugin/relativeTime"
import tz from "dayjs/plugin/timezone"
import utc from "dayjs/plugin/utc"
import { useParams } from "next/navigation"
import { useMemo } from "react"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export function useDate() {
  const params = useParams()

  const memoizedDateUtils = useMemo(() => {
    dayjs.locale(params.locale as string)

    return {
      dayjs,
      formatDate: (date: string | Date, format = "ll", timezone?: string) => {
        return dayjs(date).tz(timezone).format(format)
      },
      formatToISO: (date: string | Date) => {
        return dayjs(date || undefined).toISOString()
      },
    }
  }, [params.locale])

  return memoizedDateUtils
}
