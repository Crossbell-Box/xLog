import { SITE_URL } from "./env"

const targetKey = "connect-kit:account"

export const initProxyLocalStorage = (iframe: HTMLIFrameElement) => {
  if (!window.localStorageOrigin) {
    window.localStorageOrigin = window.localStorage

    Object.defineProperty(window, "localStorage", {
      value: {
        ...window.localStorageOrigin,
        setItem(key: string, value: string) {
          window.localStorageOrigin.setItem(key, value)

          if (targetKey === key) {
            iframe.contentWindow?.postMessage(
              {
                action: "setItem",
                key: key,
                value: value,
              },
              SITE_URL,
            )
          }
        },
      },
    })

    return new Promise<void>((resolve) => {
      const onIframeLoad = () => {
        iframe.contentWindow?.postMessage(
          {
            action: "getItem",
            key: targetKey,
          },
          SITE_URL,
        )

        window.addEventListener("message", (event: MessageEvent) => {
          if (event.origin === SITE_URL) {
            if (event.data?.key === targetKey) {
              window.localStorageOrigin.setItem(
                event.data.key,
                event.data.value,
              )
              resolve()
            }
          }
        })
      }

      if (iframe.contentWindow?.document.readyState === "complete") {
        onIframeLoad()
      } else {
        iframe.addEventListener("load", onIframeLoad)
      }
    })
  } else {
    return Promise.resolve()
  }
}
