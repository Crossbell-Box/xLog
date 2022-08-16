import { APP_NAME, OUR_DOMAIN } from "~/lib/env"
import { UniLink } from "../ui/UniLink"
import { Profile, Note } from "~/lib/types"
import Script from "next/script"

export const SiteFooter: React.FC<{
  site?: Profile
  page?: Note
}> = ({ site, page }) => {
  return (
    <>
      <footer className="text-zinc-500 border-t">
        <div className="max-w-screen-md mx-auto px-5 py-10 text-xs">
          <p className="font-medium text-base">
            &copy;{" "}
            <UniLink href="/" className="hover:text-indigo-500">
              {site?.username}
            </UniLink>{" "}
            · Powered by{" "}
            <UniLink
              href={`https://${OUR_DOMAIN}`}
              className="hover:text-indigo-500"
            >
              {APP_NAME}
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
