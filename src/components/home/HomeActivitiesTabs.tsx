"use client"

import { usePathname, useRouter } from "next/navigation"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"

import { Tabs } from "~/components/ui/Tabs"
import { UniLink } from "~/components/ui/UniLink"
import { Trans, useTranslation } from "~/lib/i18n/client"

export const HomeActivitiesTabs = () => {
  const pathname = usePathname()
  const connectModal = useConnectModal()
  const router = useRouter()
  const { t, i18n } = useTranslation("index")

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const tabs = [
    {
      text: "Latest",
      href: "/",
      active: pathname === "/",
    },
    {
      text: "Hottest",
      href: "/hottest",
      active: pathname === "/hottest",
    },
    {
      text: "Following",
      onClick: () => {
        if (!currentCharacterId) {
          connectModal.show()
        } else {
          router.push(`/following`)
        }
      },
      active: pathname === "/following",
    },
  ]

  const features = ["Write", "Own", "Earn"]

  return (
    <>
      <UniLink
        href="/about"
        className="block bg-zinc-50/70 py-6 rounded-3xl text-center mb-6 space-y-2"
      >
        <span className="block text-2xl sm:text-3xl font-bold">
          {features.map((feature) => (
            <span
              key={feature}
              className={`text-feature text-feature-${feature.toLocaleLowerCase()} block sm:inline-block sm:mr-1 mb-2`}
            >
              {t(feature)}
              {t(".")}
            </span>
          ))}
        </span>
        <span className="block text-zinc-800 text-lg sm:text-xl font-light">
          <Trans i18n={i18n} i18nKey="description" ns="index">
            <strong className="font-medium">xLog</strong> is the best{" "}
            <span className="underline decoration-2 text-yellow-400 font-medium">
              on-chain
            </span>{" "}
            and{" "}
            <span className="underline decoration-2 text-green-400 font-medium">
              open-source
            </span>{" "}
            blogging community for everyone.
          </Trans>
        </span>
      </UniLink>
      <Tabs items={tabs} className="border-none text-lg"></Tabs>
    </>
  )
}
