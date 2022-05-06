import { type LoaderFunction } from "@remix-run/node"
import { IS_PROD } from "~/lib/constants"
import { S3_BUCKET_NAME, S3_ENDPOINT } from "~/lib/env"

export const loader: LoaderFunction = ({ request }) => {
  if (IS_PROD) {
    return
  }
  const url = new URL(request.url)
  const filename = url.searchParams.get("filename")
  return fetch(`https://${S3_BUCKET_NAME}.${S3_ENDPOINT}/${filename}`)
}
