import { createContract } from "crossbell"
import { NextResponse } from "next/server"

import { ANONYMOUS_ACCOUNT_PRIVATEKEY } from "~/lib/env.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"

const contract = createContract(ANONYMOUS_ACCOUNT_PRIVATEKEY)

// /api/anonymous/comment?target=1-1&content=hello&name=Me
export async function GET(req: Request): Promise<Response> {
  const { target, content, name } = getQuery(req)

  if (!target || !content) {
    return NextResponse.json({ error: "Missing target or content" })
  }
  const res = new NextServerResponse()

  const { data } = await contract.note.postForNote({
    targetCharacterId: target.split("-")[0],
    targetNoteId: target.split("-")[1],
    characterId: 56592,
    metadataOrUri: {
      tags: ["comment"],
      sources: ["xlog"],
      content: content,
    },
    ...(name && {
      attributes: [
        {
          trait_type: "xlog_display_name",
          value: name,
        },
      ],
    }),
  })

  return res.status(200).json({
    data: {
      noteId: data.noteId.toString(),
    },
  })
}
