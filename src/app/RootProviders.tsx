"use client"

import NextNProgress from "nextjs-progressbar"
import React from "react"
import { Toaster } from "react-hot-toast"
import { WagmiConfig, createClient } from "wagmi"

import {
  ConnectKitProvider,
  getDefaultClientConfig,
} from "@crossbell/connect-kit"
import {
  NotificationModal,
  NotificationModalColorScheme,
} from "@crossbell/notification"
import { Hydrate, QueryClient } from "@tanstack/react-query"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"

import { useDarkMode } from "~/hooks/useDarkMode"
import { useMobileLayout } from "~/hooks/useMobileLayout"
import { APP_NAME } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { createIDBPersister } from "~/lib/persister.client"
import { urlComposer } from "~/lib/url-composer"

const wagmiClient = createClient(getDefaultClientConfig({ appName: APP_NAME }))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const persister = createIDBPersister()

const colorScheme: NotificationModalColorScheme = {
  text: `rgb(var(--tw-colors-i-zinc-800))`,
  textSecondary: `rgb(var(--tw-colors-i-gray-600))`,
  background: `rgb(var(--tw-colors-i-white))`,
  border: `var(--border-color)`,
}

export const RootProviders: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  useDarkMode()
  useMobileLayout()
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
          <Hydrate>
            {/* <ReactQueryDevtools /> */}
            <NextNProgress
              options={{ easing: "linear", speed: 500, trickleSpeed: 100 }}
            />
            {children}
            <Toaster />
            <NotificationModal colorScheme={colorScheme} />
          </Hydrate>
        </ConnectKitProvider>
      </PersistQueryClientProvider>
    </WagmiConfig>
  )
}
