"use client"

import {
  COLOR_SCHEME_DARK,
  COLOR_SCHEME_LIGHT,
  DARK_MODE_STORAGE_KEY,
} from "~/lib/constants"

export const ColorSchemeInjector = () => {
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `(() => {
let DARK_MODE_STORAGE_KEY = "${DARK_MODE_STORAGE_KEY}";

let data = {}
const isDark = localStorage.getItem(DARK_MODE_STORAGE_KEY)
if (typeof isDark === "undefined") {
  const currentColorScheme = window.matchMedia("(prefers-color-scheme: dark)")
    .matches
    ? "${COLOR_SCHEME_DARK}"
    : "${COLOR_SCHEME_LIGHT}"
  document.documentElement.classList.add(currentColorScheme)
} else {
  document.documentElement.classList.add(
    isDark === "true" ? "${COLOR_SCHEME_DARK}" : "${COLOR_SCHEME_LIGHT}",
  )
}
})();`,
      }}
    ></script>
  )
}
