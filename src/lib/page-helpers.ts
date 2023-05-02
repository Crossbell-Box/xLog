import dayjs from "dayjs"

import { ExpandedNote, PageVisibilityEnum } from "./types"

export const getPageVisibility = (note?: ExpandedNote) => {
  if (!note?.noteId) {
    return PageVisibilityEnum.Draft
  } else if (
    dayjs(note.metadata?.content?.date_published).isBefore(new Date())
  ) {
    if (note.local) {
      return PageVisibilityEnum.Modified
    } else {
      return PageVisibilityEnum.Published
    }
  } else {
    return PageVisibilityEnum.Scheduled
  }
}
