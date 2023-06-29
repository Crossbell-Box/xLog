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
      panelClassName="max-w-[888px] rounded-xl"
      zIndex={9}
      setOpen={() => router.back()}
    >
      {children}
    </Modal>
  )
}
