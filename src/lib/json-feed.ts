import { ExpandedNote } from "~/lib/types"

import { SITE_URL } from "./env"

export const parsePost = (post: ExpandedNote, withTwitter?: boolean) => {
  let twitter
  if (withTwitter) {
    twitter = post.character?.metadata?.content?.connected_accounts
      ?.find((account) => account?.endsWith?.("@twitter"))
      ?.match(/csb:\/\/account:([^@]+)@twitter/)?.[1]
  }
  return {
    id: `${post.characterId}-${post.noteId}`,
    title:
      `${post.metadata?.content?.title}${
        withTwitter && twitter ? ` by @${twitter}` : ""
      }` || "Untitled",
    summary: post.metadata?.content?.summary,
    content_html: post.metadata?.content?.contentHTML,
    url: `${SITE_URL}/api/redirection?characterId=${post.characterId}&noteId=${post.noteId}`,
    image: post.metadata?.content?.cover,
    date_published: post.createdAt,
    date_modified: post.updatedAt,
    tags: post.metadata?.content?.tags,
    author: {
      name: post.character?.metadata?.content?.name || post.character?.handle,
      url: `${SITE_URL}/api/redirection?characterId=${post.characterId}`,
      handle: post.character?.handle,
    },
  }
}
