import { decrypt, encrypt, getDerivedKey } from "@proselog/jwt"
import { ENCRYPT_SECRET } from "./env.server"
import { singletonAsync } from "./singleton.server"

const key = singletonAsync("encryption_key", () =>
  getDerivedKey(ENCRYPT_SECRET),
)

export const generateEncryptedToken = async (payload: any) => {
  await key.wait
  const token = await encrypt(payload, key.value, {
    expiresIn: "20m",
  })
  return token
}

export const decryptToken = async (token: string) => {
  await key.wait
  const payload = await decrypt(token, key.value)
  return payload
}

type LoginTokenPayload =
  | { type: "login"; email: string }
  | { type: "subscribe"; email: string; siteId: string }
  | {
      type: "unsubscribe"
      siteId: string
      userId: string
    }

export const generateLoginToken = async (payload: LoginTokenPayload) => {
  const token = await generateEncryptedToken(payload)
  return token
}

export const decryptLoginToken = async (token: string) => {
  const payload = await decryptToken(token)
  return payload as LoginTokenPayload
}
