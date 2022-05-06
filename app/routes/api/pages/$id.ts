import type { ActionFunction } from "@remix-run/node"
import { z } from "zod"
import { getAuthUser } from "~/lib/auth.server"
import { prismaRead, prismaWrite } from "~/lib/db.server"
import { createGate } from "~/lib/gate.server"

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method === "DELETE") {
    const user = await getAuthUser(request, true)
    const gate = createGate({ user })

    const data = z
      .object({
        id: z.string(),
      })
      .parse({
        id: params.id,
      })

    const page = await prismaRead.page.findUnique({
      where: {
        id: data.id,
      },
    })

    if (!page) {
      throw new Error("page not found")
    }

    if (!gate.allows({ type: "can-delete-page", siteId: page.siteId })) {
      throw gate.permissionError()
    }

    await prismaWrite.page.update({
      where: {
        id: page.id,
      },
      data: {
        deletedAt: new Date(),
      },
    })

    return null
  }

  throw new Error(`unsupported method: ${request.method}`)
}
