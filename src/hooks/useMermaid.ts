import React, { useEffect, useLayoutEffect } from "react"
import { loadScript } from "~/lib/load-script"

declare global {
  interface Window {
    mermaid: any
  }
}

export const useMermaid = (
  contentRef: React.MutableRefObject<HTMLElement | null>,
  deps: any,
) => {
  useEffect(() => {
    if (contentRef.current) {
      const mermaidEls = contentRef.current.querySelectorAll(".mermaid")

      if (mermaidEls.length === 0) return

      loadScript(
        "https://lf26-cdn-tos.bytecdntp.com/cdn/expire-1-M/mermaid/8.9.0/mermaid.min.js",
      ).then(() => {
        if (window.mermaid) {
          window.mermaid.initialize({
            theme: "default",
            startOnLoad: false,
          })
          window.mermaid.init(undefined, ".mermaid")
        }
      })
    }
  }, [contentRef, deps])
}
