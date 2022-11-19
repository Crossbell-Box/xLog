import dayjs from "dayjs"

import utc from "dayjs/plugin/utc"
import tz from "dayjs/plugin/timezone"

dayjs.extend(utc)
dayjs.extend(tz)

export const formatDate = (
  date: string | Date,
  format: "MMM D" | "MMM D, YYYY" | "YYYY" = "MMM D, YYYY",
  timezone?: string,
) => {
  return dayjs(date).tz(timezone).format(format)
}

export const inLocalTimezone = (date: string | Date) => {
  return dayjs(date).tz().toDate()
}
