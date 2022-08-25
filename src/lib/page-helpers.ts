import dayjs from "dayjs"
import { PageVisibilityEnum } from "./types"

export const getPageVisibility = ({
  date_published,
  metadata,
}: {
  date_published?: string
  metadata?: Object
}) => {
  if (!metadata) {
    return PageVisibilityEnum.Draft
  } else if (dayjs(date_published).isBefore(new Date())) {
    return PageVisibilityEnum.Published
  } else {
    return PageVisibilityEnum.Scheduled
  }
}
