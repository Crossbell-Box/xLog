"use client"

import {
  COLOR_SCHEME_DARK,
  COLOR_SCHEME_LIGHT,
  DARK_MODE_STORAGE_KEY,
} from "~/lib/constants"

export const ColorSchemeInjector = () => {
  const scriptContent = `
    (() => {
      const STORAGE_KEY = "${DARK_MODE_STORAGE_KEY}";
      const storedValue = localStorage.getItem(STORAGE_KEY);
      
      // Determine color scheme
      if (storedValue === null || storedValue === undefined) {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const colorScheme = prefersDark ? "${COLOR_SCHEME_DARK}" : "${COLOR_SCHEME_LIGHT}";
        document.documentElement.classList.add(colorScheme);
      } else {
        const isDark = storedValue === "true";
        document.documentElement.classList.add(isDark ? "${COLOR_SCHEME_DARK}" : "${COLOR_SCHEME_LIGHT}");
      }
    })();
  `.trim()

  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  )
}
