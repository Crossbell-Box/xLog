import { dir } from "i18next"
import { Metadata } from "next"
import { headers } from "next/headers"
import Script from "next/script"
import { Toaster } from "react-hot-toast"

import { updateIndexerFetchOptions } from "@crossbell/indexer"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"

import { getAcceptLang } from "~/lib/accept-lang"
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SLOGAN,
  SITE_URL,
  UMAMI_ID,
  UMAMI_SCRIPT,
} from "~/lib/env"
import { getColorScheme } from "~/lib/get-color-scheme"

import { ColorSchemeInjector } from "./ColorSchemeInjector"
import Providers, { mantineDefaultColorScheme, mantineTheme } from "./providers"

import "@crossbell/connect-kit/colors.css"
import "@mantine/core/styles.css"
import "~/css/main.css"

export const metadata: Metadata = {
  title: `${APP_NAME} - ${APP_SLOGAN}`,
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  generator: APP_NAME,
  keywords: [
    "blog",
    "xlog",
    "blockchain",
    "ethereum",
    "web3",
    "dapp",
    "crypto",
  ],
  themeColor: "#ffffff",
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed/latest", title: "xLog Latest" },
        { url: "/feed/hottest?interval=0", title: "xLog Hottest" },
        {
          url: "/feed/hottest?interval=1",
          title: "xLog Hottest of the Day",
        },
        {
          url: "/feed/hottest?interval=7",
          title: "xLog Hottest of the Week",
        },
        {
          url: "/feed/hottest?interval=30",
          title: "xLog Hottest of the Month",
        },
      ],
      "application/feed+json": [
        { url: "/feed/latest?format=json", title: "xLog Latest" },
        { url: "/feed/hottest?interval=0&format=json", title: "xLog Hottest" },
        {
          url: "/feed/hottest?interval=1&format=json",
          title: "xLog Hottest of the Day",
        },
        {
          url: "/feed/hottest?interval=7&format=json",
          title: "xLog Hottest of the Week",
        },
        {
          url: "/feed/hottest?interval=30&format=json",
          title: "xLog Hottest of the Month",
        },
      ],
    },
  },
  icons: `${SITE_URL}/assets/logo.svg`,
  openGraph: {
    siteName: `${APP_NAME} - ${APP_SLOGAN}`,
    description: APP_DESCRIPTION,
    images: [`${SITE_URL}/assets/logo.svg`],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} - ${APP_SLOGAN}`,
    description: APP_DESCRIPTION,
    images: [`${SITE_URL}/assets/logo.svg`],
    site: "@_xLog",
    creator: "@_xLog",
  },
}

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  const lang = getAcceptLang()
  const colorScheme = getColorScheme()

  // For viewing statistics
  const ip = headers().get("x-xlog-ip")
  if (ip) {
    updateIndexerFetchOptions({
      headers: {
        "x-forwarded-for": ip || "",
      },
    })
  }

  return (
    <html lang={lang} dir={dir(lang)} className={colorScheme}>
      <head>
        <ColorSchemeInjector />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider
          theme={mantineTheme}
          defaultColorScheme={mantineDefaultColorScheme}
        >
          <Providers lang={lang}>
            {modal}
            {children}
          </Providers>
        </MantineProvider>
        <Toaster />
        <Script
          id="xlog-umami-analytics"
          strategy="afterInteractive"
          async
          src={UMAMI_SCRIPT}
          data-website-id={UMAMI_ID}
        ></Script>
      </body>
    </html>
  )
}
