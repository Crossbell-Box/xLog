import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"
import removeMarkdown from "remove-markdown"

import { Metadata } from "@prisma/client"

import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { NextServerResponse, getQuery } from "~/lib/server-helper"

const model = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-3.5-turbo",
  temperature: 0.3,
  maxTokens: 400,
})

const chains = new Map<string, AnalyzeDocumentChain>()

const getOriginalSummary = async (cid: string, lang: string) => {
  try {
    let { content } = await (await fetch(toGateway(`ipfs://${cid}`))).json()

    if (content?.length > 5000) {
      content = content.slice(0, 5000)
    }
    if (content?.length < 200) {
      return ""
    } else if (content) {
      console.time(`fetching summary ${cid}, ${lang}`)

      let chain = chains.get(lang)
      if (!chain) {
        const prompt = new PromptTemplate({
          template: `Summarize this in "${lang}" language:
        "{text}"
        CONCISE SUMMARY:`,
          inputVariables: ["text"],
        })

        const combineDocsChain = loadSummarizationChain(model, {
          prompt,
          combineMapPrompt: prompt,
          combinePrompt: prompt,
        })

        chain = new AnalyzeDocumentChain({
          combineDocumentsChain: combineDocsChain,
        })

        chains.set(lang, chain)
      }

      const res = await chain.call({
        input_document: removeMarkdown(content, {
          useImgAltText: true,
          gfm: true,
        }),
      })

      console.timeEnd(`fetching summary ${cid}, ${lang}`)

      return res?.text
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching summary ${cid}, ${lang}`)
  }
}

export async function getSummary(cid: string, lang: string = "en") {
  const summary = await cacheGet({
    key: ["summary", cid, lang],
    getValueFun: async () => {
      if (["en", "zh", "zh-TW", "ja"].includes(lang)) {
        const key = `ai_summary_${lang.replace("-", "").toLowerCase()}`
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })
        if (meta) {
          if (meta?.[key as keyof Metadata]) {
            return meta?.[key as keyof Metadata]
          } else {
            const summary = await getOriginalSummary(cid, lang)
            if (summary) {
              await prisma.metadata.update({
                where: {
                  uri: `ipfs://${cid}`,
                },
                data: {
                  [key as keyof Metadata]: summary,
                },
              })

              return summary
            }
          }
        } else {
          const summary = await getOriginalSummary(cid, lang)
          if (summary) {
            await prisma.metadata.create({
              data: {
                uri: `ipfs://${cid}`,
                [key as keyof Metadata]: summary,
              },
            })

            return summary
          }
        }
      }
    },
    noUpdate: true,
  })

  return summary
}

export async function GET(req: Request): Promise<Response> {
  let { cid, lang } = getQuery(req)
  const res = new NextServerResponse()

  if (!cid) {
    return res.status(400).send("Bad Request")
  }

  return res.status(200).json({
    data: await getSummary(cid as string, lang as string),
  })
}
