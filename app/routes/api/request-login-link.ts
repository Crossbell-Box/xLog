import { ActionFunction, redirect } from "@remix-run/node"
import dayjs from "dayjs"
import { z } from "zod"
import { IS_PROD, OUR_DOMAIN } from "~/lib/config.shared"
import { prismaWrite } from "~/lib/db.server"
import { sendLoginEmail } from "~/lib/mailgun.server"

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData()
  const input = z
    .object({
      email: z.string(),
      referer: z.string(),
    })
    .parse({
      email: form.get("email"),
      referer: request.headers.get("referer"),
    })

  const token = await prismaWrite.loginToken.create({
    data: {
      email: input.email,
      expiresAt: dayjs().add(10, "minute").toDate(),
    },
  })

  const { protocol, host, pathname } = new URL(input.referer)

  const url = `${
    IS_PROD ? "https" : "http"
  }://${OUR_DOMAIN}/api/login?${new URLSearchParams([
    ["token", token.id],
    ["next", `${protocol}//${host}${pathname}`],
  ]).toString()}`

  await sendLoginEmail(url, input.email).catch(console.error)

  return {}
}
