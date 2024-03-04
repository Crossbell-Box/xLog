"use client"

import { useEffect, useState } from "react"

import { throttle } from "~/lib/utils"

import { FABBase } from "../ui/FAB"

const isShouldShow = () =>
  typeof window !== "undefined" &&
  document.documentElement.scrollTop > document.documentElement.clientHeight

export const BackToTopFAB = () => {
  const [shouldShow, setShouldShow] = useState(isShouldShow())
  useEffect(() => {
    const handler = throttle(() => {
      setShouldShow(isShouldShow())
    }, 16)

    document.addEventListener("scroll", handler)
    return () => {
      document.removeEventListener("scroll", handler)
    }
  }, [])

  return (
    <FABBase
      id="to-top"
      aria-label="Back to top"
      show={shouldShow}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }}
      className="xlog-back-to-top"
    >
      <i className="i-mingcute-arow-to-up-line"></i>
    </FABBase>
  )
}
