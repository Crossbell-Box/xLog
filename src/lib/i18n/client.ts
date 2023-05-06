"use client"

import i18next from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import resourcesToBackend from "i18next-resources-to-backend"
import { useEffect, useState } from "react"
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next"

import { fallbackLng, getOptions } from "./settings"

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(
    resourcesToBackend(
      (language: string, namespace: string) =>
        import(`./locales/${language}/${namespace}.json`),
    ),
  )
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ["htmlTag"],
    },
  })

export function useTranslation(ns: string) {
  const [value, setValue] = useState({
    t: i18next.getFixedT(fallbackLng, ns),
  })

  const { t } = useTranslationOrg(ns)
  useEffect(() => {
    setValue({
      t,
    })
  }, [t])

  return value
}
