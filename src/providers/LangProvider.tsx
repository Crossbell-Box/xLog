import i18next from "i18next"
import { createContext, ReactNode } from "react"

import { languages } from "~/lib/i18n/settings"

export interface LangContextType {
  lang: string
}

export const LangContext = createContext<LangContextType | undefined>(undefined)

interface LangProviderProps {
  children: ReactNode
  lang: string
}

export function LangProvider({ children, lang }: LangProviderProps) {
  if (i18next.resolvedLanguage !== lang && languages.includes(lang)) {
    i18next.changeLanguage(lang)
  }

  return (
    <LangContext.Provider value={{ lang }}>{children}</LangContext.Provider>
  )
}
