import Mailgun from "mailgun.js"
import FormData from "form-data"
import { singleton } from "./singleton.server"
import {
  APP_NAME,
  MAILGUN_APIKEY,
  MAILGUN_DOMAIN,
  MAILGUN_EU,
  OUR_DOMAIN,
} from "~/lib/env"
import type { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { IS_PROD } from "./constants"

const getClient = () =>
  singleton("mailgun", () => {
    const mg = new Mailgun(FormData)
    const client = mg.client({
      username: "api",
      key: MAILGUN_APIKEY,
      url: MAILGUN_EU ? `https://api.eu.mailgun.net` : undefined,
    })
    return client
  })

export const sendLoginEmail = async (loginLink: string, email: string) => {
  const message: MailgunMessageData = {
    from: `${APP_NAME} <hi@${OUR_DOMAIN}>`,
    to: email,
    subject: `Log in to ${APP_NAME}`,
    html: `<p>Please use the link below to log in to ${APP_NAME}:</p>

<a href="${loginLink}">login</a>

<p>This link will expire in 10 minutes.</p>
`,
  }

  console.log(message)

  if (!IS_PROD) {
    return
  }

  const client = getClient()

  await client.messages.create(MAILGUN_DOMAIN, message).then(console.log)
}
