import dayjs from "dayjs"

import utc from "dayjs/plugin/utc"
import tz from "dayjs/plugin/timezone"
import localizedFormat from "dayjs/plugin/localizedFormat"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import { useTranslation } from "next-i18next"
import "dayjs/locale/en"
import "dayjs/locale/zh"
import "dayjs/locale/zh-tw"
import "dayjs/locale/ja"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export function useDate() {
  const { i18n } = useTranslation()
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
}
