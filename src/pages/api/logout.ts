import { NextApiHandler } from "next"
import { generateCookie } from "~/lib/auth.server"

const handler: NextApiHandler = async (req, res) => {
  res.setHeader("set-cookie", generateCookie({ type: "clear" }))
  const next = req.query.next as string | undefined
  if (next) {
    res.redirect(next)
  } else {
    res.redirect("/")
  }
}

export default handler
