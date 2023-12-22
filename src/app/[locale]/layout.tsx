import "@crossbell/connect-kit/colors.css"
import "@mantine/core/styles.css"
import "remark-github-alerts/styles/github-colors-light.css"
import "remark-github-alerts/styles/github-colors-dark-class.css"
import "remark-github-alerts/styles/github-base.css"
import "~/css/main.css"

import { Viewport } from "next"
import { NextIntlClientProvider } from "next-intl"
import { getMessages, unstable_setRequestLocale } from "next-intl/server"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import Script from "next/script"
import { Toaster } from "react-hot-toast"

import { updateIndexerFetchOptions } from "@crossbell/indexer"
import { ColorSchemeScript, MantineProvider } from "@mantine/core"

import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_SLOGAN,
  SITE_URL,
  UMAMI_ID,
  UMAMI_SCRIPT,
} from "~/lib/env"
import { getColorScheme } from "~/lib/get-color-scheme"
import { withHrefLang } from "~/lib/with-hreflang"

import { ColorSchemeInjector } from "./ColorSchemeInjector"
import Providers, { mantineDefaultColorScheme, mantineTheme } from "./providers"

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export const generateMetadata = withHrefLang(async () => ({
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
}))

export default async function RootLayout({
  children,
  modal,
  params,
}: {
  children: React.ReactNode
  modal: React.ReactNode
  params?: {
    locale: string
  }
}) {
  if (!params?.locale) {
    return notFound()
  }

  // const lang = getAcceptLang()
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

  unstable_setRequestLocale(params.locale)
  const messages = await getMessages()

  return (
    <html lang={params.locale} className={colorScheme} suppressHydrationWarning>
      <head>
        <ColorSchemeInjector />
        <ColorSchemeScript />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <MantineProvider
            theme={mantineTheme}
            defaultColorScheme={mantineDefaultColorScheme}
          >
            <Providers>
              {modal}
              {children}
            </Providers>
          </MantineProvider>
        </NextIntlClientProvider>
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
