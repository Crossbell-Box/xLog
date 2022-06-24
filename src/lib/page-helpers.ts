import dayjs from "dayjs"
import { useMemo } from "react"
import { PageVisibilityEnum } from "./types"

export const usePageVisibility = ({
  date_published,
}: {
  date_published: string
}) => {
  const visibility = useMemo<
    Omit<PageVisibilityEnum, PageVisibilityEnum.All>
  >(() => {
    return getPageVisibility({ date_published })
  }, [date_published])

  return visibility
}

export const getPageVisibility = ({
  date_published,
}: {
  date_published?: string
  }) => {
  if (!date_published) {
    return PageVisibilityEnum.Draft
  } else if (dayjs(date_published).isBefore(new Date())) {
    return PageVisibilityEnum.Published
  } else if (dayjs(date_published).isBefore(new Date('9999-01-01'))) {
    return PageVisibilityEnum.Scheduled
  }
  return PageVisibilityEnum.Draft
}
