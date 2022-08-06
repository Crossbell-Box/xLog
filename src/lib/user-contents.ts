import { R2_URL } from "./env"

export function getUserContentsUrl(filename: string): string
export function getUserContentsUrl(filename: undefined | null): undefined
export function getUserContentsUrl<T extends string | undefined | null>(
  filename: T,
): T
export function getUserContentsUrl(filename: string | undefined | null) {
  if (!filename) return undefined
  return filename
}
