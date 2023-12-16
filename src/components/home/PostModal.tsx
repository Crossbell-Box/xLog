"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Modal } from "~/components/ui/Modal"
import { getSiteLink } from "~/lib/helpers"

import { UniLink } from "../ui/UniLink"

export default function PostModal({
  handle,
  children,
}: {
  handle?: string
  children: JSX.Element
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  return (
    <Modal
      open={open}
      // boxClassName="pt-12"
      panelClassName="max-w-[888px] rounded-xl relative overflow-visible"
      zIndex={9}
      setOpen={() => router.back()}
    >
      <div
        className="text-3xl absolute right-full text-white cursor-pointer mr-2 mt-2 space-y-2"
        onClick={() => {
          router.back()
        }}
      >
        <UniLink className="block" href={window.location.href} target="_blank">
          <i className="i-mingcute-expand-player-line" />
        </UniLink>
        <UniLink
          className="block"
          href={getSiteLink({
            subdomain: handle || "",
          })}
          target="_blank"
        >
          <i className="i-mingcute-user-3-line" />
        </UniLink>
      </div>
      <div className="overflow-hidden rounded-xl flex flex-col">{children}</div>
    </Modal>
  )
}
