"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Modal } from "~/components/ui/Modal"

export default function SiteModal({ children }: { children: JSX.Element }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Modal
      open={open}
      boxClassName="pt-12"
      panelClassName="max-w-[888px] rounded-xl relative overflow-visible"
      zIndex={9}
      setOpen={() => router.back()}
    >
      <div
        className="text-3xl absolute bottom-full text-white cursor-pointer"
        onClick={() => {
          window.open(window.location.href)
          setOpen(false)
        }}
      >
        <i className="icon-[mingcute--expand-player-line]" />
      </div>
      <div className="h-full overflow-y-auto rounded-xl">{children}</div>
    </Modal>
  )
}
