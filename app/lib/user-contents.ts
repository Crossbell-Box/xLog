import { IS_PROD } from "./constants"
import { S3_CDN_PREFIX } from "./env"

export function getUserContentsUrl(filename: string): string
export function getUserContentsUrl(filename: undefined | null): undefined
export function getUserContentsUrl<T extends string | undefined | null>(
  filename: T
): T
export function getUserContentsUrl(filename: string | undefined | null) {
  if (!filename) return undefined
  if (IS_PROD) {
    return `${S3_CDN_PREFIX}/${filename}`
  }
  return `/dev-s3-proxy?${new URLSearchParams({
    filename: filename,
  }).toString()}`
}
