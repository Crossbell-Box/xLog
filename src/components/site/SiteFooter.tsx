import { APP_NAME, SITE_URL } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"
import Script from "next/script"
import Image from "next/image"

export const SiteFooter: React.FC<{
  site?: Profile | null
  page?: Note | null
}> = ({ site, page }) => {
  return (
    <>
      <footer className="text-zinc-500 border-t">
        <div className="max-w-screen-md mx-auto px-5 py-10 text-xs">
          <p className="font-medium text-base">
            &copy;{" "}
            <UniLink href="/" className="hover:text-accent">
              {site?.username}
            </UniLink>{" "}
            · Powered by{" "}
            <UniLink
              href={SITE_URL}
              className="hover:text-accent inline-flex items-center align-text-top ml-1"
            >
              <Image
                alt={APP_NAME}
                src={`${SITE_URL}/logo.svg`}
                width={20}
                height={20}
              />
            </UniLink>
          </p>
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
