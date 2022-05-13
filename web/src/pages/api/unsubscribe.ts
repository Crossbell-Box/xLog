import { NextApiHandler } from "next"
import Iron from "@hapi/iron"
import { ENCRYPT_SECRET } from "~/lib/env.server"
import { unsubscribeFromSite } from "~/models/site.model"
import { prisma } from "~/lib/db.server"
import { createGate } from "~/lib/gate.server"

const handler: NextApiHandler = async (req, res) => {
  const token = req.query.token as string
  const payload: {
    siteId: string
    userId: string
  } = await Iron.unseal(token, ENCRYPT_SECRET, Iron.defaults)

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
    include: {
      memberships: true,
    },
  })
  if (!user) return res.send("invalid token")

  const gate = createGate({ user })

  await unsubscribeFromSite(gate, { siteId: payload.siteId })

  res.send("unsubscribed!")
}

export default handler
