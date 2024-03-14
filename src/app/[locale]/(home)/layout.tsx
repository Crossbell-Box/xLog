import { ConnectButton } from "~/components/common/ConnectButton"
import { DarkModeSwitch } from "~/components/common/DarkModeSwitch"
import { LanguageSwitch } from "~/components/common/LanguageSwitch"
import { Logo } from "~/components/common/Logo"
import HomeTabs from "~/components/home/HomeTabs"
import PromotionLinks from "~/components/home/PromotionLinks"
import { BackToTopFAB } from "~/components/site/BackToTopFAB"
import { FABContainer } from "~/components/ui/FAB"
import { UniLink } from "~/components/ui/UniLink"
import { APP_NAME } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"

export default async function HomeLayout({
  children,
}: {
  children?: React.ReactNode
}) {
  return (
    <>
      <header className="py-5 fixed w-full top-0 bg-white z-[2]">
        <div className="max-w-screen-xl px-5 mx-auto flex justify-between items-center">
          <div className="space-x-14 flex">
            <UniLink
              href="/"
              className="text-2xl font-extrabold flex items-center"
            >
              <div className="inline-block size-9 mr-3">
                <Logo type="svg" width={36} height={36} autoplay={false} />
              </div>
              xLog
            </UniLink>
            <div className="space-x-14 text-zinc-500 flex">
              <HomeTabs />
            </div>
          </div>
          <div className="space-x-14 text-zinc-500 flex">
            <ConnectButton size="base" variantColor="black" />
          </div>
        </div>
      </header>
      <section className="pt-24">
        <div className="max-w-screen-xl px-5 mx-auto flex">{children}</div>
      </section>
      <footer className="mt-10 font-medium border-t">
        <div className="max-w-screen-xl px-5 py-14 mx-auto flex flex-col sm:flex-row justify-between">
          <PromotionLinks className="w-full sm:w-72" />
          <span className="inline-flex items-center space-y-4 sm:space-y-0 sm:space-x-4 mx-auto sm:mx-0 mt-10 sm:mt-0 flex-col sm:flex-row">
            <DarkModeSwitch />
            <LanguageSwitch />
            <span>
              &copy;{" "}
              <UniLink
                href={getSiteLink({
                  subdomain: "xlog",
                })}
                className="hover:text-accent"
              >
                {APP_NAME}
              </UniLink>
            </span>
          </span>
        </div>
      </footer>
      <FABContainer>
        <BackToTopFAB />
      </FABContainer>
    </>
  )
}
