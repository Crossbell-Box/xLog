import { NextApiRequest, NextApiResponse } from "next"

export default async function healthcheck(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.status(200).json({
    ok: true,
  })
}
