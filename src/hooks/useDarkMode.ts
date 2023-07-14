import { MouseEvent, useEffect, useRef, useState } from "react"
import { create } from "zustand"

import {
  COLOR_SCHEME_DARK,
  COLOR_SCHEME_LIGHT,
  DARK_MODE_STORAGE_KEY,
  DEFAULT_COLOR_SCHEME,
  IS_DEV,
} from "~/lib/constants"
import { OUR_DOMAIN } from "~/lib/env"
import { noop } from "~/lib/noop"
import { delStorage, getStorage, setStorage } from "~/lib/storage"
import { isServerSide } from "~/lib/utils"

import { useGetState } from "./useGetState"

interface IMediaStore {
  isDark: boolean
  toggle: (e: MouseEvent) => void
}

const useMediaStore = create<IMediaStore>(() => {
  return {
    isDark: DEFAULT_COLOR_SCHEME === COLOR_SCHEME_DARK,
    toggle: () => void 0,
  }
})

interface DarkModeConfig {
  classNameDark?: string // A className to set "dark mode". Default = "dark".
  classNameLight?: string // A className to set "light mode". Default = "light".
  element?: HTMLElement | undefined | null // The element to apply the className. Default = `document.body`.
  transition?: ViewTransition | undefined // Specify the `animate` when switching the mode. Only Chromium >= 111 etc.
}

const useDarkModeInternal = (
  initialState: boolean | undefined,
  options: DarkModeConfig,
) => {
  const {
    classNameDark = COLOR_SCHEME_DARK,
    classNameLight = COLOR_SCHEME_LIGHT,
    element,
    transition,
  } = options

  const [darkMode, setDarkMode] = useState(initialState)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const presentedDarkMode =
      !isServerSide() && getStorage(DARK_MODE_STORAGE_KEY)

    if (presentedDarkMode !== undefined) {
      setDarkMode(presentedDarkMode === "true")
    } else if (typeof initialState === "undefined") {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      const storageValue = getStorage(DARK_MODE_STORAGE_KEY)
      const parseStorageValueAsBool = storageValue === "true"
      setDarkMode(e.matches)

      // reset dark mode, follow system
      if (parseStorageValueAsBool === e.matches) {
        delStorage(DARK_MODE_STORAGE_KEY)
      }
    }

    const storageHandler = () => {
      const storageValue = getStorage(DARK_MODE_STORAGE_KEY, true)
      // if not storage color mode, switch to follow system
      if (storageValue === undefined) {
        setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
      } else {
        // make multiple pages to switch to dark mode together.
        setDarkMode(storageValue === "true")
      }
    }

    window.addEventListener("storage", storageHandler)
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", handler)

    return () => {
      window.removeEventListener("storage", storageHandler)
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", handler)
    }
  }, [])

  const getDarkMode = useGetState(darkMode)
  useEffect(() => {
    const handler = () => {
      // if set color mode follow system, del storage
      if (
        window.matchMedia("(prefers-color-scheme: dark)").matches ===
        getDarkMode()
      ) {
        delStorage(DARK_MODE_STORAGE_KEY)
      }
    }
    window.addEventListener("beforeunload", handler)

    return () => {
      window.removeEventListener("beforeunload", handler)
    }
  }, [])
  useEffect(() => {
    if (isServerSide() || typeof darkMode === "undefined") {
      return
    }
    const $document = element || document.documentElement
    const setDarkModeClass = () => {
      if (darkMode) {
        $document.classList.remove(classNameLight)
        $document.classList.add(classNameDark)
      } else {
        $document.classList.remove(classNameDark)
        $document.classList.add(classNameLight)
      }
    }

    const { x, y } = mousePosition
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y),
    )
    transition?.ready.then(() => {
      setDarkModeClass()
      if (mousePosition.x === 0) return
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ]
      $document.animate(
        {
          clipPath: !darkMode ? clipPath : [...clipPath].reverse(),
        },
        {
          duration: 400,
          easing: "ease-in-out",
          pseudoElement: darkMode
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        },
      )
    }) ?? setDarkModeClass()
  }, [classNameDark, classNameLight, darkMode, element])

  if (isServerSide()) {
    return {
      toggle: () => {},
      value: false,
    }
  }

  return {
    value: darkMode,
    toggle: (e: MouseEvent) => {
      setDarkMode((d) => {
        if (DARK_MODE_STORAGE_KEY && !isServerSide()) {
          setStorage(DARK_MODE_STORAGE_KEY, String(!d))
          setMousePosition({ x: e.clientX, y: e.clientY })
        }
        return !d
      })
    },
  }
}

const mockElement = {
  classList: {
    add: noop,
    remove: noop,
  },
}

export const useDarkMode = () => {
  const { toggle, value } = useDarkModeInternal(
    getStorage(DARK_MODE_STORAGE_KEY),
    {
      classNameDark: COLOR_SCHEME_DARK,
      classNameLight: COLOR_SCHEME_LIGHT,
      element: (globalThis.document && document.documentElement) || mockElement,
      transition:
        !isServerSide() &&
        !!document.startViewTransition &&
        !window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
          ? document.startViewTransition()
          : undefined,
    },
  )

  useEffect(() => {
    useMediaStore.setState({
      isDark: value,
    })
    const colorScheme = value ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    document.cookie = IS_DEV
      ? `color_scheme=${colorScheme};`
      : `color_scheme=${colorScheme}; Domain=.${OUR_DOMAIN}; Path=/; Secure; expires=${date.toUTCString()}`
  }, [value])

  const onceRef = useRef(false)
  if (!onceRef.current) {
    onceRef.current = true
    useMediaStore.setState({ toggle })
  }

  return {
    toggle,
    value,
  }
}

export const useIsDark = () => useMediaStore((state) => state.isDark)

export const useDarkModeSwitch = () => {
  return useMediaStore((state) => state.toggle)
}
