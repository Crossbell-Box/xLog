import { dir } from "i18next"
import { headers } from "next/headers"
import { useRouter } from "next/router"

import "~/css/main.css"

import { languages } from "./i18n/settings"
import Providers from "./providers"

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let lng = "en"
  const router = useRouter()
  const queryLang = router.query.lang as string
  if (!queryLang) {
    let acceptLang = headers().get("accept-language")?.split(",")[0]
    if (acceptLang === "zh-HK" || acceptLang === "zh-TW") {
      acceptLang = "zh-TW"
    } else {
      acceptLang = acceptLang?.split("-")[0]
    }
    if (acceptLang) {
      lng = acceptLang
    }
  } else {
    lng = queryLang
  }

  return (
    <html lang={lng} dir={dir(lng)}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
