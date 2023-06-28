"use client"

import { usePathname } from "next/navigation"

import { getSiteRelativeUrl } from "~/lib/helpers"

import { UniLink } from "../ui/UniLink"

export default function PostTag({ tag }: { tag: string }) {
  const pathname = usePathname()

  return (
    <UniLink
      className="hover:text-zinc-600"
      href={getSiteRelativeUrl(pathname, `/tag/${tag}`)}
    >
      <>#{tag}</>
    </UniLink>
  )
}
