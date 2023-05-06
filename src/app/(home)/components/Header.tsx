import { ConnectButton } from "~/components/common/ConnectButton"
import { Logo } from "~/components/common/Logo"
import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { GITHUB_LINK } from "~/lib/env"
import { useTranslation } from "~/lib/i18n"
import { cn } from "~/lib/utils"

const tabs = [
  {
    name: "Home",
    link: "/",
  },
  {
    name: "Activities",
    link: "/activities",
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

export async function Header() {
  const { t } = await useTranslation("index")
  // const pathname = usePathname()
  // TODO how to set active state for Link in RSC,
  // make <UniLink> be client component and add activeClass props or some way else
  const pathname = "/"
  return (
    <header className="py-5 fixed w-full top-0 bg-white z-10">
      <div className="max-w-screen-lg px-5 mx-auto flex justify-between items-center">
        <UniLink href="/" className="text-2xl font-extrabold flex items-center">
          <div className="inline-block w-9 h-9 mr-3">
            <Logo type="lottie" width={36} height={36} autoplay={false} />
          </div>
          xLog
        </UniLink>
        <div className="space-x-14 text-zinc-500 flex">
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
          <ConnectButton size="base" variantColor="black" />
        </div>
      </div>
    </header>
  )
}
