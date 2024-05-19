"use client"

import { Suspense, use, useMemo, useRef, type FC } from "react"
import {
  bundledLanguages,
  bundledThemes,
  getHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type DynamicImportLanguageRegistration,
  type DynamicImportThemeRegistration,
  type Highlighter,
  type HighlighterCore,
} from "shiki"

import { shikiTransformers } from "./shared"
import type { ShikiCodeProps } from "./types"

let highlighter: Highlighter | undefined
export const createHighlighter = async () => {
  if (!highlighter) {
    highlighter = await getHighlighter({
      themes: Object.keys(bundledThemes),
      langs: Object.keys(bundledLanguages),
    })
  }
  return highlighter
}

let highlighterCore: HighlighterCore | null = null
const codeHighlighterPromise = (async () => {
  if (highlighterCore) return highlighterCore
  const [{ getHighlighterCore }, getWasm] = await Promise.all([
    import("shiki/core"),
    import("shiki/wasm").then((m) => m.default),
  ])

  const core = await getHighlighterCore({
    themes: [
      import("shiki/themes/github-light.mjs"),
      import("shiki/themes/github-dark.mjs"),
    ],
    langs: [],
    loadWasm: getWasm,
  })

  highlighterCore = core
  return core
})()

export const ShikiRender: FC<ShikiCodeProps> = (props) => {
  return (
    <Suspense
      fallback={
        <pre>
          <code>{props.code}</code>
        </pre>
      }
    >
      <ShikiRenderInternal {...props} />
    </Suspense>
  )
}

let langModule: Record<
  BundledLanguage,
  DynamicImportLanguageRegistration
> | null = null
let themeModule: Record<BundledTheme, DynamicImportThemeRegistration> | null =
  null

const ShikiRenderInternal: FC<ShikiCodeProps> = ({
  code,
  codeTheme = {
    light: "github-light-default",
    dark: "github-dark-default",
  },
  language,
}) => {
  const shiki = use(codeHighlighterPromise)
  const loadThemesRef = useRef([] as string[])
  const loadLanguagesRef = useRef([] as string[])

  use(
    useMemo(() => {
      async function register() {
        if (!language || !codeTheme) return

        async function loadShikiLanguage(
          language: string,
          languageModule: any,
        ) {
          if (!shiki) return
          if (!shiki.getLoadedLanguages().includes(language)) {
            await shiki.loadLanguage(await languageModule())
          }
        }
        async function loadShikiTheme(theme: string, themeModule: any) {
          if (!shiki) return
          if (!shiki.getLoadedThemes().includes(theme)) {
            await shiki.loadTheme(await themeModule())
          }
        }
        const [{ bundledLanguages }, { bundledThemes }] =
          langModule && themeModule
            ? [
                {
                  bundledLanguages: langModule,
                },
                { bundledThemes: themeModule },
              ]
            : await Promise.all([import("shiki/langs"), import("shiki/themes")])

        langModule = bundledLanguages
        themeModule = bundledThemes

        if (
          language &&
          loadLanguagesRef.current.includes(language) &&
          codeTheme &&
          loadThemesRef.current.includes(codeTheme)
        )
          return
        return Promise.all([
          (async () => {
            if (language) {
              const importFn = (bundledLanguages as any)[language]
              if (!importFn) return
              await loadShikiLanguage(language || "", importFn)
              loadLanguagesRef.current.push(language)
            }
          })(),
          (async () => {
            if (codeTheme) {
              const themes = [codeTheme.light, codeTheme.dark]
              return themes.map(async (theme) => {
                const importFn = (bundledThemes as any)[theme]
                if (!importFn) return
                await loadShikiTheme(theme || "", importFn)
                loadThemesRef.current.push(theme)
              })
            }
          })(),
        ])
      }
      return register()
    }, [codeTheme, language, shiki]),
  )

  const rendered = useMemo(() => {
    try {
      return shiki.codeToHtml(code, {
        lang: language!,
        themes: codeTheme,
        transformers: shikiTransformers,
      })
    } catch {
      return null
    }
  }, [shiki, code, language, codeTheme])

  if (!rendered)
    return (
      <pre>
        <code>{code}</code>
      </pre>
    )
  return <div dangerouslySetInnerHTML={{ __html: rendered }} />
}
