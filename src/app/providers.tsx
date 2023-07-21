"use client"

import { useState } from "react"
import { WagmiConfig } from "wagmi"

import { ConnectKitProvider, createWagmiConfig } from "@crossbell/connect-kit"
import {
  NotificationModal,
  NotificationModalColorScheme,
} from "@crossbell/notification"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { ModalStackProvider } from "~/components/ui/ModalStack"
// eslint-disable-next-line import/no-unresolved
import { useDarkMode } from "~/hooks/useDarkMode"
import { useMobileLayout } from "~/hooks/useMobileLayout"
// import { useNProgress } from "~/hooks/useNProgress"
import { APP_NAME, WALLET_CONNECT_V2_PROJECT_ID } from "~/lib/env"
import { filterNotificationCharacter } from "~/lib/filter-character"
import { toGateway } from "~/lib/ipfs-parser"
import { urlComposer } from "~/lib/url-composer"
import { LangProvider } from "~/providers/LangProvider"

const wagmiConfig = createWagmiConfig({
  appName: APP_NAME,
  // You can create or find it at https://cloud.walletconnect.com
  walletConnectV2ProjectId: WALLET_CONNECT_V2_PROJECT_ID,
})

const colorScheme: NotificationModalColorScheme = {
  text: `rgb(var(--tw-color-zinc-800))`,
  textSecondary: `rgb(var(--tw-color-gray-600))`,
  background: `rgb(var(--tw-color-white))`,
  border: `var(--border-color)`,
}

const createQueryClient = () => new QueryClient()
export default function Providers({
  children,
  lang,
}: {
  children: React.ReactNode
  lang: string
}) {
  useDarkMode()
  useMobileLayout()
  // useNProgress()

  const [queryClient] = useState(createQueryClient)

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider
          ipfsLinkToHttpLink={toGateway}
          urlComposer={urlComposer}
          signInStrategy="simple"
          ignoreWalletDisconnectEvent={true}
        >
          <LangProvider lang={lang}>
            <ModalStackProvider>{children}</ModalStackProvider>
          </LangProvider>

          <NotificationModal
            colorScheme={colorScheme}
            filter={filterNotificationCharacter}
          />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiConfig>
  )
}
