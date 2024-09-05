import AsyncLock from "async-lock"
import OpenAI from "openai"

import countCharacters from "~/lib/character-count"
import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"

let openai: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  // openai = new OpenAI({
  //   apiKey: process.env.OPENAI_API_KEY,
  // })
}

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
      if (!openai) {
        return {
          number: 100,
          reason: "OpenAI not configured",
        }
      }

      console.time(`fetching score ${cid}`)

      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: `You are an expert in scoring blog posts, you will evaluate this article based on three rules: 
1. Content length should not be too short.
2. Originality and innovation should be good.
3. The article should provide either good fun or logical reasoning.

Based on these criteria, you will assign a score to the article on a scale of 0-100 and provide an explanation for your decision. The evaluation should be presented in JSON format, following the structure: { "score": number, "reason": string }.

Below you find the post content:
--------
${content}
--------`,
          },
        ],
        model: "gpt-4o-mini",
        temperature: 0,
        response_format: { type: "json_object" },
      })

      let evaluate
      try {
        if (completion.choices?.[0]?.message?.content) {
          evaluate = JSON.parse(completion.choices?.[0]?.message?.content)
        }
      } catch (error) {}

      console.timeEnd(`fetching score ${cid}`)

      if (evaluate.reason) {
        return {
          number: evaluate.score,
          reason: evaluate.reason,
        }
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
