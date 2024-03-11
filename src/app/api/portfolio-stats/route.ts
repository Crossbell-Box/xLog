import * as cheerio from "cheerio"

import { PORTFOLIO_GITHUB_TOKEN } from "~/lib/env.server"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { PortfolioStats } from "~/lib/types"

export async function GET(req: Request) {
  const query = getQuery(req)

  const res = new NextServerResponse()
  if (!query.url) {
    return res.status(400).json({ error: "Missing url" })
  }

  let url: URL | undefined
  try {
    url = new URL(query.url)
  } catch (error) {
    return res.status(400).json({ error: "Invalid url" })
  }

  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"

  const result = (await cacheGet({
    key: `portfoliostats/${url}`,
    allowEmpty: true,
    noUpdate: true,
    expireTime: 60 * 60 * 24,
    getValueFun: async () => {
      let result: PortfolioStats | null = null
      switch (url?.hostname) {
        // https://www.bilibili.com/video/BV1yz4y147Ht/
        case "www.bilibili.com": {
          const bvid = url.pathname.split("/")[2]
          const { data } = await (
            await fetch(
              `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
              {
                headers: {
                  "User-Agent": ua,
                  Referer: "https://www.bilibili.com/",
                },
              },
            )
          ).json()
          if (data?.stat) {
            result = {
              videoViewsCount: data.stat.view,
              commentsCount: data.stat.reply + data.stat.danmaku,
            }
          }
          break
        }

        // https://www.xiaoyuzhoufm.com/episode/645a76f67d934b85051081c8
        case "www.xiaoyuzhoufm.com": {
          const data = await (
            await fetch(url, {
              headers: {
                "User-Agent": ua,
              },
            })
          ).text()
          const $ = cheerio.load(data)
          const audioListensCount = parseInt($(".stat").eq(0).text())
          const commentsCount = parseInt($(".stat").eq(1).text())
          if (audioListensCount || commentsCount) {
            result = {
              audioListensCount,
              commentsCount,
            }
          }
          break
        }

        // https://github.com/Crossbell-Box/xlog
        case "github.com": {
          const repoData = await (
            await fetch(
              `https://api.github.com/repos/${url.pathname.split("/")[1]}/${
                url.pathname.split("/")[2]
              }`,
              PORTFOLIO_GITHUB_TOKEN
                ? {
                    headers: {
                      Authorization: `Bearer ${PORTFOLIO_GITHUB_TOKEN}`,
                    },
                  }
                : undefined,
            )
          ).json()
          const issuesData = await (
            await fetch(
              `https://api.github.com/repos/${url.pathname.split("/")[1]}/${
                url.pathname.split("/")[2]
              }/issues`,
              PORTFOLIO_GITHUB_TOKEN
                ? {
                    headers: {
                      Authorization: `Bearer ${PORTFOLIO_GITHUB_TOKEN}`,
                    },
                  }
                : undefined,
            )
          ).json()
          if (repoData?.stargazers_count || issuesData?.[0]?.number) {
            result = {
              projectStarsCount: repoData?.stargazers_count,
              commentsCount: issuesData?.[0]?.number,
            }
          }
          break
        }

        // https://www.pixiv.net/artworks/69178118
        case "www.pixiv.net": {
          const id = url.pathname.split("/")[2]
          const { body } = await (
            await fetch(`https://www.pixiv.net/ajax/illust/${id}`, {
              headers: {
                "User-Agent": ua,
                Referer: "https://www.pixiv.net/",
              },
            })
          ).json()

          if (body?.viewCount || body?.commentCount) {
            result = {
              textViewsCount: body.viewCount,
              commentsCount: body.commentCount,
            }
          }
        }

        // https://twitter.com/DIYgod/status/1411724986977456131
        case "twitter.com": {
          const id = url.pathname.split("/")[3]
          const data = await (
            await fetch(
              `https://cdn.syndication.twimg.com/tweet-result?id=${id}`,
              {
                headers: {
                  "User-Agent": ua,
                  Referer: "https://twitter.com/",
                },
              },
            )
          ).json()
          if (data.conversation_count) {
            result = {
              commentsCount: data.conversation_count,
            }
          }
        }
      }
      return result
    },
  })) as PortfolioStats

  return res.status(200).json(result)
}
