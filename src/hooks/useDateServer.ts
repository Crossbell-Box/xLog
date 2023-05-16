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
import { useMemo } from "react"

import { useTranslation } from "~/lib/i18n"

dayjs.extend(localizedFormat)
dayjs.extend(utc)
dayjs.extend(tz)
dayjs.extend(duration)
dayjs.extend(relativeTime)

export async function useDate() {
  const { i18n } = await useTranslation()

  const memoizedDateUtils = useMemo(() => {
    dayjs.locale(i18n.resolvedLanguage)

    return {
      dayjs,
      formatDate: (date: string | Date, format = "ll", timezone?: string) => {
        return dayjs(date).tz(timezone).format(format)
      },
      formatToISO: (date: string | Date) => {
        return dayjs(date || undefined).toISOString()
      },
    }
  }, [i18n.resolvedLanguage])

  return memoizedDateUtils
}
