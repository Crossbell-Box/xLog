"use client"

import i18next from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { useEffect, useState } from "react"
import {
  initReactI18next,
  useTranslation as useTranslationOrg,
} from "react-i18next"
import { Trans as TransW } from "react-i18next/TransWithoutContext"

import { useLang } from "~/hooks/useLang"

import { defaultNS, getOptions, languageNames, languages } from "./settings"

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

export function isLanguageAuto() {
  return !window.document.cookie.includes("preferred_language")
}

export function changeLanguage(language: string) {
  if (language === "auto") {
    document.cookie =
      "preferred_language=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
  } else {
    document.cookie = `preferred_language=${language};`
  }
  window.location.reload()
}

export function useAvailableLanguages() {
  const supportedLngs = i18next.options.supportedLngs
  const languages =
    typeof supportedLngs === "object"
      ? supportedLngs.filter((i) => i !== "cimode")
      : []
  const [isMounted, setIsMounted] = useState(false)

  const [currentLng, setCurrentLng] = useState(i18next.language)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }
    if (isMounted && isLanguageAuto()) {
      setCurrentLng("auto")
    }
  }, [isMounted])

  return languages.concat("auto").map((lang) => {
    return {
      code: lang,
      name: languageNames[lang as keyof typeof languageNames],
      active: lang === currentLng,
    }
  })
}
