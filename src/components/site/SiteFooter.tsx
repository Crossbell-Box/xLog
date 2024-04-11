import { getTranslations } from "next-intl/server"
import Script from "next/script"

import { Logo } from "~/components/common/Logo"
import MarkdownContentServer from "~/components/common/MarkdownContentServer"
import { SITE_URL } from "~/lib/env"
import { ExpandedCharacter } from "~/lib/types"

import { DarkModeSwitch } from "../common/DarkModeSwitch"
import { LanguageSwitch } from "../common/LanguageSwitch"
import { UniLink } from "../ui/UniLink"
import ConnectedAccounts from "./ConnectedAccounts"

export default async function SiteFooter({
  site,
}: {
  site?: ExpandedCharacter
}) {
  const LogoWithLink = () => {
    return (
      <UniLink
        aria-label="xLog"
        href={SITE_URL}
        className="inline-flex items-center align-text-top mx-1"
      >
        <Logo type="lottie" width={20} height={20} autoplay={false} />
      </UniLink>
    )
  }

  const t = await getTranslations()

  return (
    <>
      <footer className="text-zinc-500 border-t">
        <div className="max-w-screen-lg mx-auto px-5 py-10">
          {site?.metadata?.content?.footer && (
            <MarkdownContentServer
              className="[&>.prose]:text-sm"
              content={site.metadata.content.footer}
              strictMode={true}
            />
          )}
          <div className="text-xs sm:flex justify-between sm:space-x-5 sm:space-y-0 space-y-5 sm:items-center">
            <div className="font-medium text-base">
              <span>&copy; </span>
              <UniLink href="/" className="hover:text-accent">
                <span>{site?.metadata?.content?.name}</span>
              </UniLink>
              <span> · </span>
              {t.rich("powered by", {
                name: () => <LogoWithLink />,
                span: (chunks) => <span>{chunks}</span>,
              })}
            </div>
            <ConnectedAccounts
              connectedAccounts={site?.metadata?.content?.connected_accounts}
            />
            <div className="flex gap-x-2 items-center">
              <LanguageSwitch />
              <DarkModeSwitch />
            </div>
          </div>
        </div>
      </footer>
      {site?.metadata?.content?.ga && (
        <div className="xlog-google-analytics">
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-${site.metadata?.content?.ga}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-${site.metadata?.content?.ga}');
          `}
          </Script>
        </div>
      )}
      {site?.metadata?.content?.ua && (
        <Script
          id="umami-analytics"
          strategy="afterInteractive"
          async
          src="https://analytics.umami.is/script.js"
          data-host-url={
            site.metadata?.content?.uh
              ? `https://${site.metadata?.content?.uh}`
              : undefined
          }
          data-website-id={`${site.metadata?.content?.ua}`}
        ></Script>
      )}
    </>
  )
}
