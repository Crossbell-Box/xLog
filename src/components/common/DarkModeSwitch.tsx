"use client"

import { useTheme } from "next-themes"
import { MouseEvent } from "react"

import { useMantineColorScheme } from "@mantine/core"

import { useIsClient } from "~/hooks/useClient"
import { cn } from "~/lib/utils"

const styles = {
  base: " rounded-inherit inline-flex h-[24px] w-[24px] items-center justify-center border-0 text-current",
}

const ThemeIndicator = () => {
  const { theme } = useTheme()

  const isClient = useIsClient()

  if (!isClient) return null
  if (!theme) return null
  return (
    <div
      className={cn(
        "absolute inset-y-[3px] aspect-square rounded-full bg-white shadow duration-200 transition-[left]",
        {
          "left-[3px]": theme === "light",
          "left-[27px]": theme === "system",
          "left-[51px]": theme === "dark",
        },
      )}
    />
  )
}

const ThemeSwitcher = () => {
  const { setTheme } = useTheme()
  const { setColorScheme } = useMantineColorScheme()

  const buildThemeTransition = (
    e: MouseEvent,
    theme: "light" | "dark" | "system",
  ) => {
    setColorScheme(theme === "system" ? "auto" : theme)
    return setTheme(theme)
    // disable in https://github.com/Crossbell-Box/xLog/commit/06713c901e90b57de6f5f5a0252d2c9dd874335f
    if (
      !("startViewTransition" in document) ||
      window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
    ) {
      setTheme(theme)
      return
    }

    const $document = document.documentElement

    const { x, y } = e.currentTarget.getBoundingClientRect()

    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )

    document
      .startViewTransition(() => {
        return Promise.resolve()
      })
      ?.ready.then(() => {
        setTheme(theme)

        if (x === 0) return
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ]

        $document.animate(
          {
            clipPath,
          },
          {
            duration: 300,
            easing: "ease-in",
            pseudoElement: "::view-transition-new(root)",
            // pseudoElement: darkMode
            //   ? "::view-transition-old(root)"
            //   : "::view-transition-new(root)",
          },
        )
      })
  }

  return (
    <div
      role="radiogroup"
      className="w-fit inline-flex rounded-full p-[3px] bg-zinc-200/80 text-xs"
    >
      <button
        aria-label="Switch to light theme"
        type="button"
        className={styles.base}
        onClick={(e) => {
          buildThemeTransition(e, "light")
        }}
      >
        <i className="i-mingcute-sun-line" />
      </button>
      <button
        aria-label="Switch to system theme"
        className={styles.base}
        type="button"
        onClick={(e) => {
          buildThemeTransition(e, "system")
        }}
      >
        <i className="i-mingcute-computer-line" />
      </button>
      <button
        aria-label="Switch to dark theme"
        className={styles.base}
        type="button"
        onClick={(e) => {
          buildThemeTransition(e, "dark")
        }}
      >
        <i className="i-mingcute-moon-line" />
      </button>
    </div>
  )
}

export const DarkModeSwitch = () => {
  return (
    <div className="relative">
      <ThemeIndicator />
      <ThemeSwitcher />
    </div>
  )
}
