import { createInstance } from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { Trans as TransW } from "react-i18next/TransWithoutContext"
import { initReactI18next } from "react-i18next/initReactI18next"

import { getAcceptLang } from "~/lib/accept-lang"

import { defaultNS, getOptions } from "./settings"

const initI18next = async (lng: string, ns: string) => {
  const i18nInstance = createInstance()
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        (language: string, namespace: string) =>
          import(`./locales/${language}/${namespace}.json`),
      ),
    )
    .init(getOptions(lng, ns))
  return i18nInstance
}

export async function getTranslation(ns: string = defaultNS) {
  const lang = getAcceptLang()
  const i18nextInstance = await initI18next(lang, ns)
  return {
    t: i18nextInstance.getFixedT(lang, ns),
    i18n: i18nextInstance,
  }
}

export const Trans = TransW
