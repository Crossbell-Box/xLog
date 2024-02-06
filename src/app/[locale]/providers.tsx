"use client"

import { LazyMotion, MotionConfig } from "framer-motion"
import {
  IntlError,
  IntlErrorCode,
  NextIntlClientProvider,
  useLocale,
  useMessages,
  useTimeZone,
} from "next-intl"
import { ThemeProvider } from "next-themes"
import { useState } from "react"
import { WagmiConfig } from "wagmi"

import { ConnectKitProvider, createWagmiConfig } from "@crossbell/connect-kit"
import {
  NotificationModal,
  NotificationModalColorScheme,
} from "@crossbell/notification"
import { createTheme } from "@mantine/core"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ModalStackProvider } from "~/components/ui/ModalStack"
import { useDarkModeListener } from "~/hooks/useDarkMode"
// eslint-disable-next-line import/no-unresolved
import { useMobileLayout } from "~/hooks/useMobileLayout"
import { useNProgress } from "~/hooks/useNProgress"
import { DARK_MODE_STORAGE_KEY, IS_PROD } from "~/lib/constants"
import { APP_NAME, WALLET_CONNECT_V2_PROJECT_ID } from "~/lib/env"
import { filterNotification } from "~/lib/filter"
import { toGateway } from "~/lib/ipfs-parser"
import { urlComposer } from "~/lib/url-composer"

const wagmiConfig = createWagmiConfig({
  appName: APP_NAME,
  // You can create or find it at https://cloud.walletconnect.com
  walletConnectV2ProjectId: WALLET_CONNECT_V2_PROJECT_ID,
  joyIdOptions: {
    name: APP_NAME,
    logo: "https://xlog.app/assets/logo.png",
    joyidAppURL: IS_PROD ? "https://app.joy.id" : "https://testnet.joyid.dev",
  },
})

const colorScheme: NotificationModalColorScheme = {
  text: `rgb(var(--tw-color-zinc-800))`,
  textSecondary: `rgb(var(--tw-color-gray-600))`,
  background: `rgb(var(--tw-color-white))`,
  border: `var(--border-color)`,
}

export const mantineTheme = createTheme({
  fontFamily: "var(--font-fans)",
})

let mantineDefaultColorSchemeT = "auto"
if (typeof localStorage !== "undefined") {
  if (localStorage.getItem(DARK_MODE_STORAGE_KEY) === "light") {
    mantineDefaultColorSchemeT = "light"
  } else if (localStorage.getItem(DARK_MODE_STORAGE_KEY) === "dark") {
    mantineDefaultColorSchemeT = "dark"
  }
}
export const mantineDefaultColorScheme = mantineDefaultColorSchemeT as
  | "auto"
  | "light"
  | "dark"

const loadFeatures = () =>
  import("./framer-lazy-feature").then((res) => res.default)

export default function Providers({ children }: { children: React.ReactNode }) {
  useMobileLayout()
  useNProgress()
  useDarkModeListener()

  const [queryClient] = useState(() => new QueryClient())

  const messages = useMessages()
  const locale = useLocale()
  const timeZone = useTimeZone()
  const onIntlError = (error: IntlError) => {
    if (error.code !== IntlErrorCode.MISSING_MESSAGE) {
      console.log(`Intl error`, error)
    }
  }

  return (
    <NextIntlClientProvider
      onError={onIntlError}
      locale={locale}
      messages={messages}
      timeZone={timeZone}
    >
      <ThemeProvider
        disableTransitionOnChange
        storageKey={DARK_MODE_STORAGE_KEY}
        attribute="class"
      >
        <WagmiConfig config={wagmiConfig}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider
              ipfsLinkToHttpLink={toGateway}
              urlComposer={urlComposer}
              signInStrategy="simple"
              ignoreWalletDisconnectEvent={true}
            >
              <LazyMotion features={loadFeatures} strict key="framer">
                <MotionConfig
                  transition={{
                    type: "spring",
                    duration: 0.3,
                  }}
                >
                  <ModalStackProvider>{children}</ModalStackProvider>
                </MotionConfig>
              </LazyMotion>
              <NotificationModal
                colorScheme={colorScheme}
                filter={filterNotification}
              />
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiConfig>
      </ThemeProvider>
    </NextIntlClientProvider>
  )
}
