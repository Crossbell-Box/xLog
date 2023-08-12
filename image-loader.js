import { IMAGE_PROXY_DOMAIN } from "~/lib/env"

// Docs: https://developers.cloudflare.com/images/url-format
export default function cloudflareLoader({ src, width, quality }) {
  const params = [
    `width=${width}`,
    `quality=${quality || 75}`,
    "format=auto",
    "onerror=redirect",
  ]

  let hostname = ""
  try {
    hostname = new URL(src).hostname
  } catch (error) {}

  // Bypass the restriction that the Cloudflare Image Resizing service's onerror=redirect can only be used in xlog.app domain
  if (
    !hostname === IMAGE_PROXY_DOMAIN &&
    !hostname.endsWith(`.${IMAGE_PROXY_DOMAIN}`)
  ) {
    src = `https://${IMAGE_PROXY_DOMAIN}/api/bypass?url=${encodeURIComponent(
      src,
    )}`
  }

  return `https://${IMAGE_PROXY_DOMAIN}/cdn-cgi/image/${params.join(
    ",",
  )}/${src}`
}
