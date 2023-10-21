import { createContract } from "crossbell"
import { NextResponse } from "next/server"

import { ANONYMOUS_ACCOUNT_PRIVATEKEY } from "~/lib/env.server"
import { NextServerResponse } from "~/lib/server-helper"

const contract = createContract(ANONYMOUS_ACCOUNT_PRIVATEKEY)

// /api/anonymous/comment
export async function POST(req: Request): Promise<Response> {
  const { targetCharacterId, targetNoteId, content, name, email, url } =
    await req.json()

  if (!targetCharacterId || !targetNoteId || !content || !name || !email) {
    return NextResponse.json({ error: "Missing required fields" })
  }
  const res = new NextServerResponse()

  const { data } = await contract.note.postForNote({
    targetCharacterId,
    targetNoteId,
    characterId: 56592,
    metadataOrUri: {
      tags: ["comment"],
      sources: ["xlog"],
      content,
      attributes: [
        {
          trait_type: "xlog_sender_name",
          value: name,
        },
        {
          trait_type: "xlog_sender_email",
          value: email,
        },
        {
          trait_type: "xlog_sender_url",
          value: url,
        },
      ],
    },
  })

  return res.status(200).json({
    data: {
      noteId: data.noteId.toString(),
    },
  })
}
