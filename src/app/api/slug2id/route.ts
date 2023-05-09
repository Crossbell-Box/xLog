import { NextServerResponse, getQuery } from "~/lib/server-helper"
import { getIdBySlug } from "~/queries/page.server"

// GET /api/slug2id?characterId=52055&slug=note-144
export async function GET(req: Request): Promise<Response> {
  let { characterId, slug } = getQuery(req)
  const res = new NextServerResponse()
  if (!slug || !characterId) {
    return res.status(400).send("Bad Request")
  }

  return res
    .status(200)
    .send(await getIdBySlug(slug as string, characterId as string))
}
