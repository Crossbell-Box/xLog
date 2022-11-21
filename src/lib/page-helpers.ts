import dayjs from "~/lib/date"
import { PageVisibilityEnum } from "./types"

export const getPageVisibility = ({
  date_published,
  metadata,
  preview,
}: {
  date_published?: string
  metadata?: Object
  preview?: boolean
}) => {
  if (!metadata) {
    return PageVisibilityEnum.Draft
  } else if (dayjs(date_published).isBefore(new Date())) {
    if (preview) {
      return PageVisibilityEnum.Modified
    } else {
      return PageVisibilityEnum.Published
    }
  } else {
    return PageVisibilityEnum.Scheduled
  }
}
