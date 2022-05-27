import { useEffect } from "react"
import { clipboardCopy } from "~/lib/copy.client"

export const useCodeCopy = () => {
  useEffect(() => {
    const handleCopyButtonClick = (e: any) => {
      const button: HTMLButtonElement | null =
        e.target.closest("button.copy-button")
      if (button) {
        if (button.classList.contains("copied")) return
        const pre = button.nextElementSibling
        if (pre?.tagName === "PRE") {
          clipboardCopy(pre.textContent || "")
          const textEl = button.querySelector("span:nth-child(2)")
          if (textEl) {
            const oldText = textEl.textContent
            textEl.textContent = "Copied!"
            button.classList.add("copied")
            setTimeout(() => {
              textEl.textContent = oldText
              button.classList.remove("copied")
            }, 2000)
          }
        }
      }
    }
    document.addEventListener("click", handleCopyButtonClick)
    return () => {
      document.removeEventListener("click", handleCopyButtonClick)
    }
  }, [])
}
