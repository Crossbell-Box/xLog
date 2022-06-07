import Mailgun from "mailgun.js"
import FormData from "form-data"
import { singleton } from "./singleton.server"
import {
  MAILGUN_APIKEY,
  MAILGUN_DOMAIN_NEWSLETTER,
  MAILGUN_DOMAIN_TRANSANCTION,
} from "~/lib/env.server"
import type { MailgunMessageData } from "mailgun.js/interfaces/Messages"
import { IS_PROD } from "./constants"
import { APP_NAME, OUR_DOMAIN, SITE_URL } from "./env"
import { SubscribeFormData } from "./types"
import { getSite } from "~/models/site.model"
import { type Site } from "~/lib/db.server"
import { getSiteLink } from "./helpers"
import { generateLoginToken } from "./token.server"

enum MAIL_STREAM {
  NEWSLETTER = "newsletter",
  TRANSANCTION = "transaction",
}

const enableMailgun = Boolean(
  MAILGUN_APIKEY && MAILGUN_DOMAIN_TRANSANCTION && MAILGUN_DOMAIN_NEWSLETTER,
)

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

const sendEmail = async (message: MailgunMessageData, stream: MAIL_STREAM) => {
  console.log(message)

  if (!enableMailgun) {
    console.error(
      "not sending email because no mailgun apikey or domain configured",
    )
    return
  }

  const client = getClient()

  await client.messages
    .create(
      stream === MAIL_STREAM.NEWSLETTER
        ? MAILGUN_DOMAIN_NEWSLETTER!
        : MAILGUN_DOMAIN_TRANSANCTION!,
      message,
    )
    .then(console.log)
}

const sendTransanctionEmail = async (message: MailgunMessageData) =>
  sendEmail(message, MAIL_STREAM.TRANSANCTION)

const sendNewsletterEmail = async (message: MailgunMessageData) =>
  sendEmail(message, MAIL_STREAM.NEWSLETTER)

export const sendLoginEmail = async (payload: {
  email: string
  url: string
  toSubscribeSiteId?: string
}) => {
  const { protocol, host, pathname } = new URL(payload.url)
  const token = await generateLoginToken(
    payload.toSubscribeSiteId
      ? {
          type: "subscribe",
          email: payload.email,
          siteId: payload.toSubscribeSiteId,
        }
      : {
          type: "login",
          email: payload.email,
        },
  )
  const query = new URLSearchParams([
    ["token", token],
    ["next", `${protocol}//${host}${pathname}`],
  ])

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

  if (payload.toSubscribeSiteId) {
    const site = await getSite(payload.toSubscribeSiteId)
    subject = `Confirm your subscription to ${site.name}`
    html = `
    <p>Please confirm your subscription to "${site.name}" by clicking the link below:</p>
    
    <a href="${loginLink}">confirm</a>
    
    <p>This link will expire in 7 days. If you did not request this link, you can safely ignore this email.</p>`
  }

  const message: MailgunMessageData = {
    from: `${APP_NAME} <hi@proselog.com>`,
    to: payload.email,
    subject,
    html,
  }

  await sendTransanctionEmail(message)
}

export const sendEmailForNewPost = async (payload: {
  post: {
    emailSubject?: string | null
    slug: string
    title: string
    rendered: { contentHTML: string }
  }
  site: Site
  subscribers: { id: string; email: string }[]
}) => {
  if (payload.subscribers.length === 0) return
  try {
    const from = `${payload.site.name} <updates@${payload.site.subdomain}.proselog.com>`
    const subject =
      payload.post.emailSubject ||
      `${payload.post.title} - ${payload.site.name}`

    const siteLink = getSiteLink({ subdomain: payload.site.subdomain })
    const html = `
    <a href="${siteLink}/${
      payload.post.slug
    }" style="display:block;background:#eee;padding:5px 8px;border-radius:4px;text-decoration:none;">
      View this post in browser
    </a>

    <h1 style="font-size:2.4em">${payload.post.title}</h1>

    <div>
    ${payload.post.rendered.contentHTML}
    </div>


    <p style="margin-top:3em;">
      <a 
        href="${`${SITE_URL}/api/login?next=/ignore&token=%recipient.unsubscribeToken%`}" 
        style="text-decoration:none;">
        Unsubscribe
      </a>
    </p>

    <p>
      <a 
        href="${SITE_URL}" 
        style="text-decoration:none;">
        Published on Proselog
      </a>
    </p>
    `

    const recipientVariables: {
      [email in string]: { unsubscribeToken: string }
    } = {}

    await Promise.allSettled(
      payload.subscribers.map(async (sub) => {
        const unsubscribeToken = await generateLoginToken({
          type: "unsubscribe",
          userId: sub.id,
          siteId: payload.site.id,
        })
        recipientVariables[sub.email] = {
          unsubscribeToken,
        }
      }),
    )

    const message: MailgunMessageData = {
      from,
      subject,
      html,
      // TODO: segment by every 800 subscribers
      to: Object.keys(recipientVariables),
      "recipient-variables": JSON.stringify(recipientVariables),
    }

    await sendNewsletterEmail(message)
  } catch (error) {
    console.error(error)
  }
}
