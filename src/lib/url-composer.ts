import { ConnectKitProviderProps } from "@crossbell/connect-kit"

import { CSB_XFEED, SITE_URL } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"

export const urlComposer: ConnectKitProviderProps["urlComposer"] = {
  characterUrl: ({ handle }) => getSiteLink({ subdomain: handle }),
  noteUrl: (note) => {
    let originalNote = note

    while (originalNote?.toNote) {
      originalNote = originalNote.toNote
    }

    if (originalNote.metadata?.content?.sources?.includes("xlog")) {
      return `${SITE_URL}/api/redirection?characterId=${originalNote.characterId}&noteId=${originalNote.noteId}`
    } else {
      return `${CSB_XFEED}/notes/${note.characterId}-${note.noteId}`
    }
  },
}
