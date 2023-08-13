"use client"

import i18next from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next"
import { Trans as TransW } from "react-i18next/TransWithoutContext"

import { useLang } from "~/hooks/useLang"

import { defaultNS, getOptions, languages } from "./settings"

i18next
  .use(initReactI18next)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
  })

export function useTranslation(ns: string = defaultNS) {
  const { lang } = useLang()
  if (i18next.resolvedLanguage !== lang && languages.includes(lang)) {
    i18next.changeLanguage(lang)
  }
  return useTranslationOrg(ns)
}

export const Trans = TransW

export function getAvailableLanguages() {
  const supportedLngs = i18next.options.supportedLngs
  return typeof supportedLngs === "object"
    ? supportedLngs.filter((i) => i !== "cimode")
    : []
}
