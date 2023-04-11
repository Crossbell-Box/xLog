import { APP_NAME, SITE_URL } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"
import Script from "next/script"
import Image from "next/image"
import { Platform } from "~/components/site/Platform"
import { Trans } from "next-i18next"
import { Logo } from "~/components/common/Logo"
import { useEffect, useState } from "react"

export const SiteFooter: React.FC<{
  site?: Profile | null
  page?: Note | null
}> = ({ site, page }) => {
  const [logoType, setLogoType] = useState<"svg" | "png" | "lottie">("svg")

  useEffect(() => {
    setLogoType("lottie")
  }, [])

  const LogoWithLink = () => {
    return (
      <UniLink
        href={SITE_URL}
        className="inline-flex items-center align-text-top mx-1"
      >
        <Logo type={logoType} width={20} height={20} autoplay={false} />
      </UniLink>
    )
  }

  return (
    <>
      <footer className="text-zinc-500 border-t">
        <div className="max-w-screen-md mx-auto px-5 py-10 text-xs flex justify-between">
          <div className="font-medium text-base">
            <span>&copy; </span>
            <UniLink href="/" className="hover:text-accent">
              <span>{site?.name}</span>
            </UniLink>
            <span> · </span>
            <Trans
              i18nKey="powered by"
              defaults={"<span>Powered by </span><name/>"}
              components={{
                name: <LogoWithLink />,
                span: <span />,
              }}
              ns="site"
            />
          </div>
          {site?.connected_accounts && (
            <div className="ml-5 -mr-5">
              {site?.connected_accounts.map((account, index) => (
                <Platform
                  key={index}
                  platform={account.platform}
                  username={account.identity}
                  className="mr-2 sm:mr-5"
                ></Platform>
              ))}
            </div>
          )}
        </div>
      </footer>
      {site?.ga && (
        <div className="xlog-google-analytics">
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=G-${site.ga}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-${site.ga}');
          `}
          </Script>
        </div>
      )}
    </>
  )
}
