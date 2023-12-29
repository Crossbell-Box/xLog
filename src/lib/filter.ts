import { CharacterEntity, NoteEntity } from "crossbell"

import { ParsedNotification } from "@crossbell/indexer"

import filter from "../../data/filter.json"

type CharacterId = CharacterEntity["characterId"]

export function filterGenerator<T>(
  blacklist: CharacterId[],
  getCharacterId: (item: T) => CharacterId | null | undefined,
  blackKeywords: string[],
  getContent: (item: T) => string | null | undefined,
) {
  const cache = new Map(blacklist.map((characterId) => [characterId, true]))

  return function filter(item: T): boolean {
    const characterId = getCharacterId(item)
    const content = getContent(item)

    const characterIdCheck = characterId && !cache.has(characterId)
    const contentCheck =
      !content || !blackKeywords.some((keyword) => content.includes(keyword))

    return !!(characterIdCheck && contentCheck)
  }
}

export const filterNotification = filterGenerator(
  filter.comment,
  ({ fromCharacter }: ParsedNotification) => fromCharacter?.characterId,
  filter.comment_content,
  (notification: ParsedNotification) => {
    if (notification.type === "comment-note") {
      return notification.commentNote.metadata?.content?.content
    } else {
      return null
    }
  },
)

export const filterComment = filterGenerator(
  filter.comment,
  ({ characterId }: NoteEntity) => characterId,
  filter.comment_content,
  ({ metadata }: NoteEntity) => {
    return metadata?.content?.content
  },
)
