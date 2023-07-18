import { ImageResponse, type NextRequest } from "next/server"
import uniqolor from "uniqolor"

import { gql } from "@urql/core"

import { toGateway } from "~/lib/ipfs-parser"
import { client } from "~/queries/graphql"

const fontNormal = fetch(
  "https://github.com/lxgw/LxgwWenKai/releases/download/v1.300/LXGWWenKai-Regular.ttf",
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
    const subtitle = result.data.note.metadata?.content?.summary?.slice(0, 15)
    const avatar = toGateway(
      result.data.note.character.metadata?.content?.avatars?.[0],
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
          style={{
            display: "flex",
            height: "100%",
            width: "100%",

            background: `linear-gradient(37deg, ${bgAccent} 27.82%, ${bgAccentLight} 79.68%, ${bgAccentUltraLight} 100%)`,

            fontFamily: "LXGW WenKai Screen R",

            padding: "5rem",
            alignItems: "flex-end",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",

              position: "absolute",
              left: "5rem",
              top: "5rem",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {avatar && (
              <img
                src={avatar}
                style={{
                  borderRadius: "50%",
                }}
                height={120}
                width={120}
              />
            )}

            <span
              style={{
                marginLeft: "3rem",
                color: "#ffffff99",
                fontSize: "2rem",
              }}
            >
              <h3>{siteName}</h3>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "flex-end",
              flexDirection: "column",
              textAlign: "right",
            }}
          >
            <h1
              style={{
                color: "rgba(255, 255, 255, 0.92)",

                fontSize: "4.2rem",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                WebkitLineClamp: 1,
                lineClamp: 1,
              }}
            >
              {title?.slice(0, 20)}
            </h1>
            <h2
              style={{
                color: "rgba(230, 230, 230, 0.85)",
                fontSize: "3rem",
              }}
            >
              {subtitle}
            </h2>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 600,
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
