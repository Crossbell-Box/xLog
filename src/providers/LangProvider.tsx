import { ReactNode, createContext } from "react"

export interface LangContextType {
  lang: string
}

export const LangContext = createContext<LangContextType | undefined>(undefined)

interface LangProviderProps {
  children: ReactNode
  lang: string
}

export function LangProvider({ children, lang }: LangProviderProps) {
  return (
    <LangContext.Provider value={{ lang }}>{children}</LangContext.Provider>
  )
}
