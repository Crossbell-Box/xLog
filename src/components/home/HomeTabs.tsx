"use client"

import { useTranslations } from "next-intl"
import { usePathname } from "next/navigation"

import { Image } from "~/components/ui/Image"
import { GITHUB_LINK } from "~/lib/env"
import { cn } from "~/lib/utils"

import { UniLink } from "../ui/UniLink"

const tabs = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "About",
    link: "/about",
  },
  {
    name: (
      <Image
        className="no-optimization w-24"
        alt="github stars"
        src="https://img.shields.io/github/stars/Crossbell-Box/xLog?color=white&label=Stars&logo=github&style=social"
      />
    ),
    link: GITHUB_LINK,
  },
]

export default function HomeTabs() {
  const pathname = usePathname()
  const t = useTranslations()

  return (
    <>
      {tabs?.map((tab, index) => (
        <UniLink
          className={cn(
            "cursor-pointer items-center hidden sm:flex hover:text-accent text-lg",
            {
              "text-accent": pathname === tab.link,
            },
          )}
          key={tab.link}
          href={tab.link}
        >
          {typeof tab.name === "string" ? t(tab.name) : tab.name}
        </UniLink>
      ))}
    </>
  )
}
