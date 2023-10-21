import { type CharacterEntity } from "crossbell"

import { autocompletion, type Completion } from "@codemirror/autocomplete"
import { indexer } from "@crossbell/indexer"
import { getDefaultAvatarIpfsUrl } from "@crossbell/ui"
import {
  extractCharacterAvatar,
  extractCharacterName,
} from "@crossbell/util-metadata"

import { toGateway } from "~/lib/ipfs-parser"

async function fetchCharacters(query: string) {
  return (await indexer.search.characters(query, { limit: 10 })).list
}

type CompletionWithCharacter = Completion & { character?: CharacterEntity }

export function mentionAutocompletion() {
  return autocompletion({
    icons: false,
    addToOptions: [
      {
        render({ character }: CompletionWithCharacter) {
          if (!character) return null

          const container = document.createElement("div")
          const img = document.createElement("img")

          container.className =
            "inline-flex items-center justify-center pr-1 py-1 align-middle"
          img.className = "w-5 h-5 object-cover rounded-md"
          img.src = toGateway(
            extractCharacterAvatar(character) ??
              getDefaultAvatarIpfsUrl(character.handle),
          )

          container.appendChild(img)

          return container
        },
        position: 20,
      },
    ],
    override: [
      async (context) => {
        let word = context.matchBefore(/@\w+/)

        if (!word) return null

        const characters = await fetchCharacters(word.text.slice(1))
        const completions: Completion[] = characters.map((character) => {
          const handle = `@${character.handle}`
          const characterName = extractCharacterName(character, {
            fallbackToHandle: false,
          })

          return {
            label: handle,
            detail: characterName,
            apply: `${handle} `,
            character,
          }
        })

        return { from: word.from, options: completions }
      },
    ],
  })
}
