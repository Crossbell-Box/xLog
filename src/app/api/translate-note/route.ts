import AsyncLock from "async-lock"
import { LLMChain } from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"

import { Metadata } from "@prisma/client"

import { languageNames } from "~/i18n"
import { toGateway } from "~/lib/ipfs-parser"
import { llmModelSwitcherByTextLength } from "~/lib/llm-model-switcher-by-text-length"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { Language } from "~/lib/types"

const lock = new AsyncLock()

type ContentTranslation = {
  title?: string
  content?: string
}

let translationModel4K: OpenAI | undefined
let translationModel16K: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  const options = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
    maxTokens: -1,
  }
  translationModel4K = new OpenAI({ ...options, modelName: "gpt-3.5-turbo" })
  translationModel16K = new OpenAI({
    ...options,
    modelName: "gpt-3.5-turbo-16k",
  })
}

type ChainKeyType = `${4 | 16}k_${Language}` // e.g. "4k_en" | "4k_zh" | "4k_zh-TW" | "4k_ja" | "16k_en" | "16k_zh" | "16k_zh-TW" | "16k_ja"
const translationChains = new Map<ChainKeyType, LLMChain>()

const getOriginalTranslation = async (
  cid: string,
  targetLang: Language,
  originalLang?: Language,
): Promise<ContentTranslation | undefined> => {
  if (!translationModel4K || !translationModel16K) return

  try {
    const { title, content } = await (
      await fetch(toGateway(`ipfs://${cid}`))
    ).json()

    // If the detected language is the same as the target language, return the original content
    if (originalLang === targetLang) {
      console.warn(
        `|__ Warn: Detected language is the same as the target language, return the original content: ${cid}, ${targetLang}`,
      )
      return
    }

    console.time(`fetching translation ${cid}, ${targetLang}`)
    const { modelSize, tokens } = llmModelSwitcherByTextLength(content, {
      includeResponse: { lang: targetLang },
    })

    if (!modelSize) {
      console.error(
        `|__ Error: Content too long for translation: ${cid}, ${targetLang}. (Tokens: ${tokens})`,
      )
      return
    }

    let chain = translationChains.get(`${modelSize}_${targetLang}`)

    if (!chain) {
      const template = `
Translate the following text and don't translate the Markdown syntax or tags.

Original text:

{text}

${languageNames[targetLang]} translation:
`

      const prompt = new PromptTemplate({
        template,
        inputVariables: ["text"],
      })

      const translateModel =
        modelSize === "4k" ? translationModel4K : translationModel16K

      chain = new LLMChain({ llm: translateModel, prompt })

      translationChains.set(`${modelSize}_${targetLang}`, chain)
    }

    const t =
      String(title).trim().length === 0
        ? { text: "" }
        : await chain.call({ text: title })

    const c =
      String(content).trim().length === 0
        ? { text: "" }
        : await chain.call({ text: content })

    console.timeEnd(`fetching translation ${cid}, ${targetLang}`)

    return {
      title: t.text,
      content: c.text,
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching translation ${cid}, ${targetLang}`)
  }
}

async function getTranslation({
  cid,
  fromLang,
  toLang = "en",
}: {
  cid: string
  fromLang?: Language
  toLang?: Language
}): Promise<ContentTranslation | undefined> {
  if (fromLang === toLang) {
    return undefined
  }

  const translatedContent = (await cacheGet({
    key: ["translation", cid, toLang],
    allowEmpty: true,
    noUpdate: true,
    noExpire: true,
    getValueFun: async () => {
      let result

      await lock.acquire(`translation_${cid}`, async () => {
        const meta = await prisma.metadata.findFirst({
          where: {
            uri: `ipfs://${cid}`,
          },
        })

        const key = "ai_translation"
        const translations = meta?.[key as keyof Metadata] as Record<
          string,
          ContentTranslation
        >
        const translatedJson = translations?.[toLang]

        if (translatedJson) {
          result = translatedJson
        } else {
          const newTranslation = await getOriginalTranslation(cid, toLang)
          if (newTranslation) {
            /**
             * e.g.
             *
             * {
             *  "en": {
             *    "title": "title",
             *    "content": "content"
             *  },
             *  "zh": {
             *    "title": "标题",
             *    "content": "内容"
             *  },
             *  ...
             * }
             *
             */
            const finalTranslation = {
              ...translations,
              [toLang]: newTranslation,
            }

            if (meta) {
              await prisma.metadata.update({
                where: { uri: `ipfs://${cid}` },
                data: {
                  [key as keyof Metadata]: finalTranslation,
                },
              })
            } else {
              await prisma.metadata.create({
                data: {
                  uri: `ipfs://${cid}`,
                  [key as keyof Metadata]: finalTranslation,
                },
              })
            }
            result = newTranslation
          }
        }
      })

      return result
    },
  })) as ContentTranslation | undefined

  return translatedContent
}

export async function GET(req: Request): Promise<Response> {
  let { cid, fromLang, toLang } = getQuery(req)

  const res = new NextServerResponse()

  if (!cid) {
    return res.status(400).send("Bad Request")
  }

  return res.status(200).json({
    data: await getTranslation({
      cid,
      fromLang,
      toLang,
    }),
  })
}
