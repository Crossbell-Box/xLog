import { dir } from "i18next"
import { Metadata } from "next"
import { headers } from "next/headers"

import "~/css/main.css"
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "~/lib/env"
import { fallbackLng } from "~/lib/i18n/settings"

import Providers from "./providers"

// default site meta
export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: `${SITE_URL}/assets/logo.svg`, // default site icon
  openGraph: {
    siteName: APP_NAME,
    description: "", // modify by pages
  },
  twitter: {
    title: undefined,
    description: undefined,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let lng = fallbackLng

  let acceptLang = headers().get("accept-language")?.split(",")[0]
  if (acceptLang === "zh-HK" || acceptLang === "zh-TW") {
    acceptLang = "zh-TW"
  } else {
    acceptLang = acceptLang?.split("-")[0]
  }
  if (acceptLang) {
    lng = acceptLang
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
