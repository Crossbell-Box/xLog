import AsyncLock from "async-lock"

import countCharacters from "~/lib/character-count"
import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"

const lock = new AsyncLock()

const getOriginalScore = async (cid: string) => {
  try {
    let { content, tags } = await (
      await fetch(toGateway(`ipfs://${cid}`))
    ).json()

    if (tags?.[0] === "portfolio" || tags?.[0] === "short") {
      return {
        number: 100,
        reason: "Whitelist content",
      }
    }

    if (content?.length > 5000) {
      content = content.slice(0, 5000)
    }

    if (countCharacters(content) > 300) {
      console.time(`fetching score ${cid}`)

      const prompt = `According to rule 1 not too short content, rule 2 good originality and innovation, and rule 3 good fun or logic, give this article a score in the range of 0-100 and explain the reason:
      "${content}"
      Score:`
      const response = await (
        await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4",
            temperature: 0,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        })
      ).json()

      console.timeEnd(`fetching score ${cid}`)

      return {
        number: parseInt(response.choices?.[0]?.message?.content?.trim()),
        reason: response.choices?.[0]?.message?.content
          ?.trim()
          .replace(/^\d+([,.\s]*)/, "")
          .trim()
          .replace(/^Reason:/, "")
          .trim(),
      }
    } else {
      return {
        number: 0,
        reason: "Content too short",
      }
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching score ${cid}`)
  }
}

async function getScore(cid: string) {
  const score = await cacheGet({
    key: ["summary_score", cid],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      let result
      await lock.acquire(cid, async () => {
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })
        if (meta) {
          if (meta?.ai_score !== null) {
            result = {
              number: meta.ai_score,
              reason: meta.ai_score_reason,
            }
          } else {
            const score = await getOriginalScore(cid)
            if (score) {
              await prisma.metadata.update({
                where: {
                  uri: `ipfs://${cid}`,
                },
                data: {
                  ai_score: score.number,
                  ai_score_reason: score.reason,
                },
              })

              result = score
            }
          }
        } else {
          const score = await getOriginalScore(cid)
          if (score) {
            await prisma.metadata.create({
              data: {
                uri: `ipfs://${cid}`,
                ai_score: score.number,
                ai_score_reason: score.reason,
              },
            })

            result = score
          }
        }
      })
      return result
    },
  })

  return score
}

export async function GET(req: Request): Promise<Response> {
  let { cid } = getQuery(req)

  const res = new NextServerResponse()

  if (!cid) {
    return res.status(400).send("Bad Request")
  }

  return res.status(200).json({
    data: await getScore(cid as string),
  })
}
