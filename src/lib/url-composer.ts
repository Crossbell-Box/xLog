import { UrlComposer } from "@crossbell/ui"

import { getNoteSlug, getSiteLink } from "~/lib/helpers"
import { CSB_IO } from "~/lib/env"

export const urlComposer: Partial<UrlComposer> = {
  characterUrl: ({ handle }) => getSiteLink({ subdomain: handle }),
  noteUrl: (note) => {
    let originalNote = note

    while (originalNote?.toNote) {
      originalNote = originalNote.toNote
    }

    if (originalNote.metadata?.content?.sources?.includes("xlog")) {
      const { character } = originalNote

      if (character) {
        return (
          getSiteLink({
            subdomain: character.handle,
          }) +
          "/" +
          getNoteSlug(originalNote) +
          (originalNote !== note ? `#comments` : "")
        )
      } else {
        return ""
      }
    } else {
      return `${CSB_IO}/notes/${note.characterId}-${note.noteId}`
    }
  },
}
