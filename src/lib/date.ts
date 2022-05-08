import dayjs from "dayjs"

export const formatDate = (date: string | Date) => {
  return dayjs(date).format("MMM D, YYYY")
}
