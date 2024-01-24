import dayjs from "~/lib/dayjs"

import { ExpandedNote, PageVisibilityEnum } from "./types"

export const getPageVisibility = (note?: ExpandedNote) => {
  if (!note?.noteId) {
    return PageVisibilityEnum.Draft
  } else if (
    !note.metadata?.content?.date_published ||
    dayjs(note.metadata?.content?.date_published).isBefore(new Date()) ||
    dayjs(note.metadata?.content?.date_published).isSame(new Date())
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
