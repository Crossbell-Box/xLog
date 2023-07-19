"use client"

import { useServerInsertedHTML } from "next/navigation"

import {
  COLOR_SCHEME_DARK,
  COLOR_SCHEME_LIGHT,
  DARK_MODE_STORAGE_KEY,
} from "~/lib/constants"

export const ColorSchemeInjector = () => {
  useServerInsertedHTML(() => {
    return (
      <script
        dangerouslySetInnerHTML={{
          __html: `(() => {
let DARK_MODE_STORAGE_KEY = "${DARK_MODE_STORAGE_KEY}";
let namespace = "xlog"
let getStorage = (key) => {
  let data = {}
  try {
    data = JSON.parse(localStorage.getItem(namespace) || "{}")
  } catch (error) {}
  return data[key]
}
let COLOR_SCHEME_LIGHT = "${COLOR_SCHEME_LIGHT}";
let COLOR_SCHEME_DARK = "${COLOR_SCHEME_DARK}";

let data = {}
const isDark = getStorage(DARK_MODE_STORAGE_KEY)
if (typeof isDark === "undefined") {
  const currentColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? COLOR_SCHEME_DARK
    : COLOR_SCHEME_LIGHT
  document.documentElement.classList.add(currentColorScheme)
} else {
  document.documentElement.classList.add(
    isDark === "true" ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT,
  )
}
})();`,
        }}
      ></script>
    )
  })
  return null
}
