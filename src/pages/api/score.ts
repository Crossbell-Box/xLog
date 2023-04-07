import { NextApiRequest, NextApiResponse } from "next"

import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"

const getOriginalScore = async (cid: string) => {
  try {
    const { content } = await (await fetch(toGateway(`ipfs://${cid}`))).json()

    if (content?.length > 200) {
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

export async function getScore(cid: string) {
  const score = await cacheGet({
    key: ["summary_score", cid],
    getValueFun: async () => {
      const meta = await prisma.metadata.findFirst({
        where: {
          uri: `ipfs://${cid}`,
        },
      })
      if (meta) {
        if (meta?.ai_score !== null) {
          return {
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

            return score
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

          return score
        }
      }
    },
    noUpdate: true,
  })

  return score
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { cid } = req.query

  if (!cid) {
    res.status(400).send("Bad Request")
    return
  }

  res.status(200).json({
    data: await getScore(cid as string),
  })
}
