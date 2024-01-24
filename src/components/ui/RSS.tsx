import Parser from "rss-parser"

import { Image } from "~/components/ui/Image"
import dayjs from "~/lib/dayjs"
import { SITE_URL } from "~/lib/env"

function extractImgSrc(htmlString: string) {
  const regex = /<img[^>]+src="([^">]+)"/g
  const matches = htmlString.match(regex)
  if (matches?.[0]) {
    const src = matches[0].match(/src="([^">]+)"/)?.[1]
    return src
  }
  return null
}

export default async function RSS({
  src,
  limit,
}: {
  src: string
  limit?: number
}) {
  let feed: Parser.Output<{
    [key: string]: any
  }> | null = null

  if (src) {
    try {
      feed = (
        await (await fetch(`${SITE_URL}/api/rss-parser?url=${src}`)).json()
      ).data
    } catch (error) {}
  }

  if (limit && feed?.items) {
    feed = {
      ...feed,
      items: feed.items.slice(0, +limit),
    }
  }

  return (
    <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 sm:gap-6">
      {feed?.items?.map((item) => {
        const img = extractImgSrc(item.content || item.description || "")
        console.log(img, img?.startsWith("https://"))

        return (
          <a
            key={item.guid || item.link}
            href={item.link}
            className="rounded-2xl border aspect-square relative flex overflow-hidden group text-sm"
          >
            {img?.startsWith("https://") && (
              <Image
                src={img}
                alt={item.title || item.description || ""}
                width={300}
                height={300}
                className="rounded-2xl object-cover"
              />
            )}
            <span className="text-white text-center absolute bottom-0 bg-gradient-to-b from-transparent to-black/70 w-full h-16 flex flex-col items-center justify-center group-hover:h-full transition-[height] hover:backdrop-blur">
              <span className="font-bold">{item.title}</span>
              <span className="hidden group-hover:block mt-4">
                {item.contentSnippet}
              </span>
              <span className="text-white">
                {dayjs
                  .duration(
                    dayjs(item.isoDate).diff(dayjs(), "minute"),
                    "minute",
                  )
                  .humanize()}{" "}
                ago
              </span>
            </span>
          </a>
        )
      })}
    </div>
  )
}
