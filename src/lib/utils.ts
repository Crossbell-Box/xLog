import { ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

type Truthy<T> = T extends false | "" | 0 | null | undefined ? never : T // from lodash

export function truthy<T>(value: T): value is Truthy<T> {
  return Boolean(value)
}

export function stripHTML(html: string) {
  return html.replace(/<(?:.|\n)*?>/gm, "")
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
        acc[key] = obj[key]
      }
      return acc
    },
    {} as Pick<T, K>,
  )
}

export const isServerSide = () => typeof window === "undefined"

export const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean
  return function () {
    const args = arguments
    // @ts-ignore
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const scrollTo = (hash: string, notUserContent?: boolean) => {
  const calculateElementTop = (el: HTMLElement) => {
    let top = 0
    while (el) {
      top += el.offsetTop
      el = el.offsetParent as HTMLElement
    }
    return top
  }

  const _hash = decodeURIComponent(hash.slice(1))
  if (!_hash) return
  if (history.state?.preventScrollToToc) {
    history.state.preventScrollToToc = false
    return
  }
  const targetElement = document.querySelector(
    notUserContent
      ? `#${decodeURIComponent(_hash)}`
      : `#user-content-${decodeURIComponent(_hash)}`,
  ) as HTMLElement
  if (!targetElement) return

  window.scrollTo({
    top: calculateElementTop(targetElement) - 20,
    behavior: "smooth",
  })
}

export const isMobileDevice = () => {
  if (isServerSide()) {
    return false
  } else {
    const userAgent = window.navigator.userAgent
    const isIOS = /(iPad|iPhone|iPod)/.test(userAgent)
    const isIPadOS = /Macintosh/.test(userAgent) && navigator.maxTouchPoints > 1
    // const isAndroid = /Android/.test(userAgent);

    return isIOS || isIPadOS
  }
}

export const isMacOS = () => {
  const userAgent = window.navigator.userAgent
  const isMacOS = /Mac OS X/.test(userAgent)

  return isMacOS
}
