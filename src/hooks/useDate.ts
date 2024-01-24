import { useLocale } from "next-intl"
import { useMemo } from "react"

import dayjs from "~/lib/dayjs"

export function useDate() {
  const locale = useLocale()

  const memoizedDateUtils = useMemo(() => {
    dayjs.locale(locale)

    return {
      dayjs,
      formatDate: (date: string | Date, format = "ll", timezone?: string) => {
        return dayjs(date).tz(timezone).format(format)
      },
      formatToISO: (date: string | Date) => {
        return dayjs(date || undefined).toISOString()
      },
    }
  }, [locale])

  return memoizedDateUtils
}
