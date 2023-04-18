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
import { useTranslation } from "next-i18next"
import { useMemo } from "react"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export function useDate() {
  const { i18n } = useTranslation()

  const memoizedDateUtils = useMemo(() => {
    dayjs.locale(i18n.resolvedLanguage)

    return {
      dayjs,
      formatDate: (date: string | Date, format = "ll", timezone?: string) => {
        return dayjs(date).tz(timezone).format(format)
      },
      formatToISO: (date: string | Date) => {
        return dayjs(date).toISOString()
      },
      inLocalTimezone: (date: string | Date) => {
        return dayjs(date).tz().toDate()
      },
    }
  }, [i18n.resolvedLanguage])

  return memoizedDateUtils
}
