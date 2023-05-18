import { MouseEvent, useEffect, useRef, useState } from "react"
import { create } from "zustand"

import {
  COLOR_SCHEME_DARK,
  COLOR_SCHEME_LIGHT,
  DEFAULT_COLOR_SCHEME,
  IS_DEV,
} from "~/lib/constants"
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
  storageKey?: string // Specify the `localStorage` key. Default = "darkMode". set to `undefined` to disable persistent storage.
  transition?: any // Specify the `animate` when switching the mode. Only Chromium >= 111 etc.
}

const darkModeKey = "darkMode"
const useDarkModeInternal = (
  initialState: boolean | undefined,
  options: DarkModeConfig,
) => {
  const {
    classNameDark = COLOR_SCHEME_DARK,
    classNameLight = COLOR_SCHEME_LIGHT,
    storageKey = darkModeKey,
    element,
    transition,
  } = options

  const [darkMode, setDarkMode] = useState(initialState)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const presentedDarkMode = !isServerSide() && getStorage(storageKey)

    if (presentedDarkMode !== undefined) {
      setDarkMode(presentedDarkMode === "true")
    } else if (typeof initialState === "undefined") {
      setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches)
    }
  }, [storageKey])

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => {
      const storageValue = getStorage(storageKey)
      const parseStorageValueAsBool = storageValue === "true"
      setDarkMode(e.matches)

      // reset dark mode, follow system
      if (parseStorageValueAsBool === e.matches) {
        delStorage(storageKey)
      }
    }

    const storageHandler = () => {
      const storageValue = getStorage(storageKey, true)
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
  }, [storageKey])

  const getDarkMode = useGetState(darkMode)
  useEffect(() => {
    const handler = () => {
      // if set color mode follow system, del storage
      if (
        window.matchMedia("(prefers-color-scheme: dark)").matches ===
        getDarkMode()
      ) {
        delStorage(darkModeKey)
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
    const setDarkModeClass = () => {
      if (darkMode) {
        $el.classList.remove(classNameLight)
        $el.classList.add(classNameDark)
      } else {
        $el.classList.remove(classNameDark)
        $el.classList.add(classNameLight)
      }
    }

    const $el = element || document.documentElement
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
      $el.animate(
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
        if (storageKey && !isServerSide()) {
          setStorage(storageKey, String(!d))
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
  const { toggle, value } = useDarkModeInternal(getStorage(darkModeKey), {
    classNameDark: COLOR_SCHEME_DARK,
    classNameLight: COLOR_SCHEME_LIGHT,
    storageKey: darkModeKey,
    element: (globalThis.document && document.documentElement) || mockElement,
    transition:
      !isServerSide() &&
      !!document.startViewTransition &&
      !window.matchMedia(`(prefers-reduced-motion: reduce)`).matches
        ? document.startViewTransition()
        : undefined,
  })

  useEffect(() => {
    useMediaStore.setState({
      isDark: value,
    })
    const colorScheme = value ? COLOR_SCHEME_DARK : COLOR_SCHEME_LIGHT
    const date = new Date()
    date.setMonth(date.getMonth() + 1)
    document.cookie = IS_DEV
      ? `color_scheme=${colorScheme};`
      : `color_scheme=${colorScheme}; Domain=.xlog.app; Path=/; Secure; HttpOnly; expires=${date.toUTCString()}`
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
