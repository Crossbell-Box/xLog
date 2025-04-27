import Parser from "rss-parser"

import { Button, Card, CardContent, CardMedia, Typography } from "@mui/material"

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
    } catch (error) {
      console.error("Error fetching RSS feed", error)
    }
  }

  if (limit && feed?.items) {
    feed = {
      ...feed,
      items: feed.items.slice(0, +limit),
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gap: "16px",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}
    >
      {feed?.items?.map((item) => {
        const img = extractImgSrc(item.content || item.description || "")

        return (
          <Card key={item.guid || item.link} style={{ position: "relative" }}>
            {img?.startsWith("https://") && (
              <CardMedia
                component="img"
                alt={item.title || item.description || "RSS Feed Image"}
                image={img}
                style={{ height: "200px", objectFit: "cover" }}
              />
            )}
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {item.title}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {item.contentSnippet}
              </Typography>
              <Typography
                variant="caption"
                display="block"
                color="textSecondary"
              >
                {dayjs
                  .duration(
                    dayjs(item.isoDate).diff(dayjs(), "minute"),
                    "minute",
                  )
                  .humanize()}{" "}
                ago
              </Typography>
            </CardContent>
            <Button
              size="small"
              color="primary"
              component="a"
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "white",
              }}
            >
              Read More
            </Button>
          </Card>
        )
      })}
    </div>
  )
}
