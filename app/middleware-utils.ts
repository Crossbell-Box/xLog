const REDIRECTS = new Set([301, 302, 303, 307, 308])

export function validateURL(url: string | URL): string {
  try {
    return String(new URL(String(url)))
  } catch (error: any) {
    throw new Error(`URLs is malformed. Please use only absolute URLs`)
  }
}

// Should kept in sync with Next.js https://cs.github.com/vercel/next.js/blob/4a8a3d2400a54448b615fbc75cd91ca8cfea256c/packages/next/server/utils.ts#L18
export function isBot(userAgent: string): boolean {
  return /Googlebot|Mediapartners-Google|AdsBot-Google|googleweblight|Storebot-Google|Google-PageRenderer|Bingbot|BingPreview|Slurp|DuckDuckBot|baiduspider|yandex|sogou|LinkedInBot|bitlybot|tumblr|vkShare|quora link preview|facebookexternalhit|facebookcatalog|Twitterbot|applebot|redditbot|Slackbot|Discordbot|WhatsApp|SkypeUriPreview|ia_archiver/i.test(
    userAgent
  )
}

export const REWRITE_HEADER = "x-middleware-rewrite"
export const NEXT_HEADER = "x-middleware-next"

export class MiddlewareResponse extends Response {
  static rewrite(destination: string | URL) {
    return new MiddlewareResponse(null, {
      headers: {
        [REWRITE_HEADER]: validateURL(destination),
      },
    })
  }

  static next() {
    return new MiddlewareResponse(null, {
      headers: {
        [NEXT_HEADER]: "1",
      },
    })
  }

  static redirect(url: string | URL, status = 307) {
    if (!REDIRECTS.has(status)) {
      throw new RangeError(
        'Failed to execute "redirect" on "response": Invalid status code'
      )
    }

    const destination = validateURL(url)
    return new MiddlewareResponse(destination, {
      headers: { Location: destination },
      status,
    })
  }
}
