import "aplayer-react/dist/index.css"
import { dir } from "i18next"
import { Metadata } from "next"
import { Toaster } from "react-hot-toast"

import "~/css/main.css"
import { useAcceptLang } from "~/hooks/useAcceptLang"
import { APP_DESCRIPTION, APP_NAME, SITE_URL } from "~/lib/env"

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
  const lang = useAcceptLang()

  return (
    <html lang={lang} dir={dir(lang)}>
      <body>
        <Providers lang={lang}>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
