import Mailgun from "mailgun.js"
import FormData from "form-data"
import { singleton } from "./singleton.server"
import { MAILGUN_APIKEY, MAILGUN_DOMAIN, MAILGUN_EU } from "~/lib/env.server"
import type { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { IS_PROD } from "./constants"
import { APP_NAME, OUR_DOMAIN } from "./env"
import { SubscribeFormData } from "./types"
import { getSite } from "~/models/site.model"

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

export const sendLoginEmail = async (payload: {
  token: string
  email: string
  url: string
  subscribeForm?: SubscribeFormData
}) => {
  const { protocol, host, pathname } = new URL(payload.url)
  const query = new URLSearchParams([
    ["token", payload.token],
    ["next", `${protocol}//${host}${pathname}`],
  ])
  if (payload.subscribeForm) {
    query.append("subscribe", JSON.stringify(payload.subscribeForm))
  }
  const loginLink = `${
    IS_PROD ? "https" : "http"
  }://${OUR_DOMAIN}/api/login?${query.toString()}`

  let subject = `Log in to ${APP_NAME}`

  let html = `<p>Please use the link below to log in to ${APP_NAME}:</p>

  <a href="${loginLink}">login</a>
  
  <p>This link will expire in 10 minutes.</p>
  `

  if (payload.subscribeForm) {
    const site = await getSite(payload.subscribeForm.siteId)
    subject = `Confirm your subscription to ${site.name}`
    html = `
    <p>Please confirm your subscription to ${site.name} by clicking the link below:</p>
    
    <a href="${loginLink}">confirm</a>
    
    <p>This link will expire in 10 minutes.</p>`
  }

  const message: MailgunMessageData = {
    from: `${APP_NAME} <hi@${OUR_DOMAIN}>`,
    to: payload.email,
    subject,
    html,
  }

  console.log(message)

  if (!IS_PROD) {
    return
  }

  const client = getClient()

  await client.messages.create(MAILGUN_DOMAIN, message).then(console.log)
}
