import AsyncLock from "async-lock"
import { LLMChain } from "langchain/chains"
import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"

import { Metadata } from "@prisma/client"

import { languageNames } from "~/i18n"
import { detectLanguage } from "~/lib/detect-lang"
import { toGateway } from "~/lib/ipfs-parser"
import prisma from "~/lib/prisma.server"
import { cacheGet } from "~/lib/redis.server"
import { getQuery, NextServerResponse } from "~/lib/server-helper"
import { Language } from "~/lib/types"

const lock = new AsyncLock()

type ContentTranslation = {
  title?: string
  content?: string
}

let openai: OpenAI | undefined
if (process.env.OPENAI_API_KEY) {
  const options = {
    openAIApiKey: process.env.OPENAI_API_KEY,
    temperature: 0.2,
    maxTokens: -1,
  }
  openai = new OpenAI({ ...options, modelName: "gpt-4o-mini" })
}

type ChainKeyType = Language // e.g. "4k_en" | "4k_zh" | "4k_zh-TW" | "4k_ja" | "16k_en" | "16k_zh" | "16k_zh-TW" | "16k_ja"
const translationChains = new Map<ChainKeyType, LLMChain>()

const getOriginalTranslation = async ({
  cid,
  toLang,
  fromLang,
}: {
  cid: string
  toLang: Language
  fromLang?: Language
}): Promise<ContentTranslation | undefined> => {
  if (fromLang === toLang) return

  if (!openai) return

  try {
    const { title, content } = await (
      await fetch(toGateway(`ipfs://${cid}`))
    ).json()

    if (!fromLang && detectLanguage(title + content) === toLang) return

    console.time(`fetching translation ${cid}, ${toLang}`)

    let chain = translationChains.get(toLang)

    if (!chain) {
      const template = `
You are a Markdown translation expert. During the translation process, you need to pay special attention to maintaining the integrity of all Markdown syntax and tags, and not changing the function of HTML tags, to ensure that the translated content does not affect the rendering of any syntax or tags. Please follow the following rules to translate:

1. Identify and translate text content: Only identify and translate plain text content in Markdown, including text in headings, paragraphs, and list items.

2. Retain tags and attributes: When encountering HTML tags (such as <img>, <video>, <a>, etc.), please only translate the user-visible text in the tags (such as the text in the alt attribute), and retain all tags, attribute names and link addresses unchanged.

3. Special syntax processing: For Markdown-specific syntax (such as link, image tag ![alt text](link)), only translate the descriptive text part (such as alt text) without changing the link or syntax structure.

4. Keep the format unchanged: Ensure that all Markdown formatting (such as bold, italics, code blocks) remains unchanged during translation.

5. Your task is to ensure that the translated content is both accurate and does not break the original Markdown structure and the function of HTML tags. Please check carefully during translation to ensure the correct rendering of syntax and tags.

6. You are only allowed to return the translated text and nothing else. 

IMPORTANT: ONLY RETURN TRANSLATED TEXT AND NOTHING ELSE.

Translate the following text to ${languageNames[toLang]} language:

{text}
`

      const prompt = new PromptTemplate({
        template,
        inputVariables: ["text"],
      })

      chain = new LLMChain({ llm: openai, prompt })

      translationChains.set(toLang, chain)
    }

    const t =
      String(title).trim().length === 0
        ? { text: "" }
        : await chain.call({ text: title })

    const c =
      String(content).trim().length === 0
        ? { text: "" }
        : await chain.call({ text: content })

    console.timeEnd(`fetching translation ${cid}, ${toLang}`)

    return {
      title: t.text,
      content: c.text,
    }
  } catch (error) {
    console.error(error)
    console.timeEnd(`fetching translation ${cid}, ${toLang}`)
  }
}

async function getTranslation({
  cid,
  toLang,
  fromLang,
}: {
  cid: string
  toLang: Language
  fromLang?: Language
}): Promise<ContentTranslation | undefined> {
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
          const newTranslation = await getOriginalTranslation({
            cid,
            toLang,
            fromLang,
          })
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
    return res.status(400).json({ error: "Missing cid" })
  }

  if (!toLang) {
    return res.status(400).json({ error: "Missing toLang" })
  }

  return res.status(200).json({
    data: await getTranslation({
      cid,
      fromLang,
      toLang,
    }),
  })
}
