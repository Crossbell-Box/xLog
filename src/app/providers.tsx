"use client"

import NextNProgress from "nextjs-progressbar"
import { useState } from "react"
import { WagmiConfig, createClient } from "wagmi"

import {
  ConnectKitProvider,
  getDefaultClientConfig,
} from "@crossbell/connect-kit"
import {
  NotificationModal,
  NotificationModalColorScheme,
} from "@crossbell/notification"
import { QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

// eslint-disable-next-line import/no-unresolved
import { useDarkMode } from "~/hooks/useDarkMode"
import { useMobileLayout } from "~/hooks/useMobileLayout"
import { APP_NAME } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { createIDBPersister } from "~/lib/persister.client"
import { urlComposer } from "~/lib/url-composer"
import { LangProvider } from "~/providers/LangProvider"

const wagmiClient = createClient(getDefaultClientConfig({ appName: APP_NAME }))

const persister = createIDBPersister()

const colorScheme: NotificationModalColorScheme = {
  text: `rgb(var(--tw-colors-i-zinc-800))`,
  textSecondary: `rgb(var(--tw-colors-i-gray-600))`,
  background: `rgb(var(--tw-colors-i-white))`,
  border: `var(--border-color)`,
}

export default function Providers({
  children,
  lang,
}: {
  children: React.ReactNode
  lang: string
}) {
  useDarkMode()
  useMobileLayout()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            cacheTime: 1000 * 60 * 60 * 24, // 24 hours
          },
        },
      }),
  )

  return (
    <WagmiConfig client={wagmiClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{
          persister,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              const queryIsReadyForPersistance =
                query.state.status === "success"
              if (queryIsReadyForPersistance) {
                return !((query.state?.data as any)?.pages?.length > 1)
              } else {
                return false
              }
            },
          },
        }}
      >
        <ConnectKitProvider
          ipfsLinkToHttpLink={toGateway}
          urlComposer={urlComposer}
          signInStrategy="simple"
          ignoreWalletDisconnectEvent={true}
        >
          <NextNProgress
            options={{ easing: "linear", speed: 500, trickleSpeed: 100 }}
          />
          <LangProvider lang={lang}>{children}</LangProvider>
          <NotificationModal colorScheme={colorScheme} />
        </ConnectKitProvider>
      </PersistQueryClientProvider>
    </WagmiConfig>
  )
}
