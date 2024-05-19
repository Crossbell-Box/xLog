import type { StringLiteralUnion, ThemeRegistrationAny } from "shiki/types.mjs"

export interface ShikiCodeProps {
  codeTheme?: ThemeRegistrationAny | StringLiteralUnion<any>
  language?: string
  code: string
}
