"use client"

import { useCallback, useEffect } from "react"

import { Image } from "~/components/ui/Image"

async function OIAPage() {
  useEffect(() => {
    document.body.style.backgroundColor = "#fb9148"
    return () => {
      document.body.style.backgroundColor = ""
    }
  }, [])

  const download = useCallback(() => {
    const result = confirm(
      "The app is currently under review, please stay tuned. Do you want to join the early access program?",
    )
    const dcLink = "https://discord.gg/uK2yAtWw2s"
    if (result) {
      window.open(dcLink)
    }
  }, [])

  const goBack = useCallback(() => {
    window.history.back()
  }, [])

  return (
    <div className="relative h-screen w-screen bg-accent max-w-4xl m-auto">
      <Image
        fill
        className="object-cover absolute h-full w-full"
        src="/assets/download-preview.png"
        alt="Download Preview"
      />
      <div className="absolute top-5 w-full text-xs text-center text-[white]">
        已下载？下拉打开应用
      </div>
      <button
        className="absolute left-1/2 transform -translate-x-1/2 bottom-[15%] text-accent px-4 py-2 rounded-[25px] w-[56.5%] bg-[white]"
        onClick={download}
      >
        立即下载
      </button>
      <button
        className="absolute left-1/2 transform -translate-x-1/2 translate-y-[150%] bottom-[15%] text-[white] px-4 py-2 rounded-[25px] w-[56.5%]"
        onClick={goBack}
      >
        取消下载
      </button>
    </div>
  )
}

export default OIAPage
