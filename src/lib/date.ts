import dayjs from "dayjs"

export const formatDate = (
  date: string | Date,
  format: "MMM D" | "MMM D, YYYY" | "YYYY" = "MMM D, YYYY"
) => {
  return dayjs(date).format(format)
}
