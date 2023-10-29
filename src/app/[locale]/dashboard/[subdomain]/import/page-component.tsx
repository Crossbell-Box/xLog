"use client"

import { usePathname } from "next/navigation"

import { DashboardMain } from "~/components/dashboard/DashboardMain"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { useTranslation } from "~/lib/i18n/client"

export default function ImportPage() {
  const pathname = usePathname()
  const { t } = useTranslation("dashboard")

  const options = [
    {
      name: "Markdown files",
      path: "/markdown",
      icon: "markdown.svg",
    },
    {
      name: "Mirror.xyz",
      path: "/mirror",
      icon: "mirror.xyz.svg",
    },
  ]

  return (
    <DashboardMain title="Import">
      <div className="min-w-[270px] max-w-screen-lg flex flex-col space-y-4">
        {options.map((option) => (
          <UniLink
            className="prose p-6 bg-slate-100 rounded-lg relative flex items-center"
            key={option.name}
            href={pathname + option.path}
          >
            <span className="w-8 h-8 mr-4">
              <Image
                fill
                src={`/assets/${option.icon}`}
                alt={option.name}
              ></Image>
            </span>
            <span className="font-medium">
              {t(`Import from ${option.name}`)}
            </span>
          </UniLink>
        ))}
      </div>
    </DashboardMain>
  )
}
