import dayjs from "dayjs"
import { useMemo } from "react"
import { PageVisibilityEnum } from "./types"

export const usePageVisibility = ({
  published,
  publishedAt,
}: {
  published: boolean
  publishedAt: string | Date | null
}) => {
  const visibility = useMemo<
    Omit<PageVisibilityEnum, PageVisibilityEnum.All>
  >(() => {
    return getPageVisibility({ published, publishedAt })
  }, [published, publishedAt])

  return visibility
}

export const getPageVisibility = ({
  published,
  publishedAt,
}: {
  published: boolean
  publishedAt: string | Date | null
}) => {
  if (!published) {
    return PageVisibilityEnum.Draft
  }
  if (published && publishedAt && dayjs(publishedAt).isBefore(new Date())) {
    return PageVisibilityEnum.Published
  }
  return PageVisibilityEnum.Scheduled
}
