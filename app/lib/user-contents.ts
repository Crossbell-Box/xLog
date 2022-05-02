import { IS_PROD, OUR_DOMAIN } from "./config.shared"

export function getUserContentsUrl(filename: string): string
export function getUserContentsUrl(filename: undefined | null): undefined
export function getUserContentsUrl<T extends string | undefined | null>(
  filename: T
): T
export function getUserContentsUrl(filename: string | undefined | null) {
  if (!filename) return undefined
  if (IS_PROD) {
    return `https://usercontents.${OUR_DOMAIN}/${filename}`
  }
  return `/dev-s3-proxy?${new URLSearchParams({
    filename: filename,
  }).toString()}`
}
