import Mailgun from "mailgun.js"
import FormData from "form-data"
import { singleton } from "./singleton.server"
import {
  ENCRYPT_SECRET,
  MAILGUN_APIKEY,
  MAILGUN_DOMAIN,
} from "~/lib/env.server"
import type { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { IS_PROD } from "./constants"
import { APP_NAME, OUR_DOMAIN, SITE_URL } from "./env"
import { SubscribeFormData } from "./types"
import { getSite } from "~/models/site.model"
import { type Site } from "~/lib/db.server"
import Iron from "@hapi/iron"
import { renderPageForEmail } from "~/models/page.model"

const enableMailgun = Boolean(MAILGUN_APIKEY && MAILGUN_DOMAIN)

const getClient = () =>
  singleton("mailgun", () => {
    const mg = new Mailgun(FormData)
    const client = mg.client({
      username: "api",
      key: MAILGUN_APIKEY,
      timeout: 60000,
    })
    return client
  })

const sendEmail = async (message: MailgunMessageData) => {
  console.log(message)

  if (!enableMailgun) {
    console.error(
      "not sending email because no mailgun apikey or domain configured"
    )
    return
  }

  const client = getClient()

  await client.messages.create(MAILGUN_DOMAIN, message).then(console.log)
}

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

  let subject = `Sign in to ${APP_NAME}`

  let html = `
  <p>Hello,</p>

  <p>We received a request to sign in to ${APP_NAME} using this email address, please click the link below to sign in:</p>

  <a href="${loginLink}">Sign in to ${APP_NAME}</a>
  
  <p>This link will expire in 10 minutes. If you did not request this link, you can safely ignore this email.</p>
  
  <p>Thanks,</p>

  <p>Your Proselog Team</p>
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
    from: `${APP_NAME} <hi@proselog.com>`,
    to: payload.email,
    subject,
    html,
  }

  await sendEmail(message)
}

export const sendEmailForNewPost = async (payload: {
  post: { slug: string; title: string }
  site: Site
  subscribers: { id: string; email: string }[]
}) => {
  try {
    const from = `${payload.site.name} <updates@${payload.site.subdomain}.proselog.com>`
    const subject = `${payload.post.title} - ${payload.site.name}`

    const html = await renderPageForEmail({
      pageSlug: payload.post.slug,
      subdomain: payload.site.subdomain,
    })

    const recipientVariables: {
      [email in string]: { unsubscribeToken: string }
    } = {}

    await Promise.allSettled(
      payload.subscribers.map(async (sub) => {
        const unsubscribeToken = await Iron.seal(
          {
            userId: sub.id,
            siteId: payload.site.id,
          },
          ENCRYPT_SECRET,
          Iron.defaults
        )
        recipientVariables[sub.email] = {
          unsubscribeToken,
        }
      })
    )

    const message: MailgunMessageData = {
      from,
      subject,
      html,
      to: Object.keys(recipientVariables),
      "recipient-variables": JSON.stringify(recipientVariables),
    }

    await sendEmail(message)
  } catch (error) {
    console.error(error)
  }
}
