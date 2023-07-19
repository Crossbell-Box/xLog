import { ImageResponse, type NextRequest } from "next/server"
import removeMarkdown from "remove-markdown"
import uniqolor from "uniqolor"

import { gql } from "@urql/core"

import { toGateway } from "~/lib/ipfs-parser"
import { client } from "~/queries/graphql"

const fontNormal = fetch(
  "https://github.com/lxgw/LxgwWenKai-Screen/releases/download/v1.300/LXGWWenKaiScreenR.ttf",
).then((res) => res.arrayBuffer())

export const runtime = "edge"

export const revalidate = 60 * 60 * 24 // 24 hours
export const GET = async (req: NextRequest) => {
  try {
    const fontData = await fontNormal

    // api/og?characterId=52055&noteId=286&site=innei-4525
    const noteId = req.nextUrl.searchParams.get("noteId")
    const characterId = req.nextUrl.searchParams.get("characterId")

    if (!noteId || !characterId)
      return new Response(`Missing noteId or characterId`, { status: 400 })

    const result = await client
      .query(
        gql`
          query getNote($characterId: Int!, $noteId: Int!) {
            note(
              where: {
                note_characterId_noteId_unique: {
                  characterId: $characterId
                  noteId: $noteId
                }
              }
            ) {
              metadata {
                content
              }
              character {
                handle
                metadata {
                  content
                }
              }
            }
          }
        `,
        {
          characterId: parseInt(characterId),
          noteId: parseInt(noteId),
        },
      )
      .toPromise()
    const title = result.data.note.metadata?.content?.title
    const subtitle =
      result.data.note.metadata?.content?.summary ||
      removeMarkdown(result.data.note.metadata.content.content)
    const avatar = toGateway(
      result.data.note.character.metadata?.content?.avatars?.[0] ||
        `https://api.dicebear.com/6.x/bottts-neutral/svg?seed=${characterId}`,
    )

    const siteName =
      result.data.note.character.metadata?.content?.site_name ||
      result.data.note.character.metadata?.content?.name

    const bgAccent = uniqolor(title, {
      saturation: [30, 35],
      lightness: [60, 70],
    }).color

    const bgAccentLight = uniqolor(title, {
      saturation: [30, 35],
      lightness: [80, 90],
    }).color

    const bgAccentUltraLight = uniqolor(title, {
      saturation: [30, 35],
      lightness: [95, 96],
    }).color

    return new ImageResponse(
      (
        <div
          tw="flex h-full w-full p-20 items-center justify-between flex-col"
          style={{
            background: `linear-gradient(37deg, ${bgAccent} 27.82%, ${bgAccentLight} 79.68%, ${bgAccentUltraLight} 100%)`,
            fontFamily: "LXGW WenKai Screen R",
          }}
        >
          <div tw="flex items-center w-full -mb-20">
            {avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="avatar"
                src={avatar}
                tw="rounded-full"
                height={130}
                width={130}
              />
            )}
            <span tw="ml-10 text-zinc-100 text-7xl">
              <h3>{siteName}</h3>
            </span>
          </div>
          <h1 tw="text-white text-[9rem] font-bold line-clamp-2 overflow-hidden w-full text-center flex items-center justify-center">
            <span tw="max-h-[350px]">{title}</span>
          </h1>
          <div tw="flex items-center justify-center w-full">
            <h2
              tw="text-zinc-200 text-8xl"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {subtitle}
            </h2>
          </div>
        </div>
      ),
      {
        width: 1920,
        height: 1080,
        fonts: [
          {
            name: "LXGW WenKai Screen R",
            data: fontData,
            weight: 400,
            style: "normal",
          },
        ],
      },
    )
  } catch (e: any) {
    return new Response(`Failed to generate the OG image. Error ${e.message}`, {
      status: 500,
    })
  }
}
