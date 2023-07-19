import { CharacterEntity } from "crossbell"

import { ParsedNotification } from "@crossbell/indexer"

import filter from "../../data/filter.json"

type CharacterId = CharacterEntity["characterId"]

export function filterCharacter<T>(
  blacklist: CharacterId[],
  getCharacterId: (item: T) => CharacterId | null | undefined,
) {
  const cache = new Map(blacklist.map((characterId) => [characterId, true]))

  return function filter(item: T): boolean {
    const characterId = getCharacterId(item)

    return characterId ? !cache.has(characterId) : false
  }
}

export const filterNotificationCharacter = filterCharacter(
  filter.comment,
  ({ fromCharacter }: ParsedNotification) => fromCharacter?.characterId,
)

export const filterCommentCharacter = filterCharacter(
  filter.comment,
  ({ characterId }: Pick<CharacterEntity, "characterId">) => characterId,
)
