"use client"

import { useTheme } from "next-themes"
import { MouseEvent } from "react"

import { useIsClient } from "~/hooks/useClient"

const styles = {
  base: " rounded-inherit inline-flex h-[32px] w-[32px] items-center justify-center border-0 text-current",
}

const ThemeIndicator = () => {
  const { theme } = useTheme()

  const isClient = useIsClient()

  if (!isClient) return null
  if (!theme) return null
  return (
    <div
      className="absolute top-[3px] z-[-1] h-[32px] w-[32px] rounded-full bg-zinc-200/80 shadow-[0_1px_2px_0_rgba(127.5,127.5,127.5,.2),_0_1px_3px_0_rgba(127.5,127.5,127.5,.1)] duration-200 bg-blend-multiply transition-[left]"
      style={{
        left: { light: 4, system: 36, dark: 68 }[theme],
      }}
    />
  )
}

const ThemeSwitcher = () => {
  const { setTheme } = useTheme()

  const buildThemeTransition = (
    e: MouseEvent,
    theme: "light" | "dark" | "system",
  ) => {
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
      className="w-fit-content inline-flex rounded-full border border-slate-200 p-[3px]"
    >
      <button
        aria-label="Switch to light theme"
        type="button"
        className={styles.base}
        onClick={(e) => {
          buildThemeTransition(e, "light")
        }}
      >
        <i className="icon-[mingcute--sun-line] scale-75" />
      </button>
      <button
        aria-label="Switch to system theme"
        className={styles.base}
        type="button"
        onClick={(e) => {
          buildThemeTransition(e, "system")
        }}
      >
        <i className="icon-[mingcute--computer-line] scale-75" />
      </button>
      <button
        aria-label="Switch to dark theme"
        className={styles.base}
        type="button"
        onClick={(e) => {
          buildThemeTransition(e, "dark")
        }}
      >
        <i className="icon-[mingcute--moon-line] scale-75" />
      </button>
    </div>
  )
}

export const DarkModeSwitch = () => {
  return (
    <div className="relative">
      <ThemeSwitcher />
      <ThemeIndicator />
    </div>
  )
}
