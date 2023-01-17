import "~/css/main.css"
import "~/generated/uno.css"

import { Toaster } from "react-hot-toast"
import { createClient, WagmiConfig } from "wagmi"
import { Hydrate, QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import {
  ConnectKitProvider,
  useAccountState,
  useConnectModal,
  useUpgradeAccountModal,
} from "@crossbell/connect-kit"
import { InitContractProvider } from "@crossbell/contract"
import { useRefCallback } from "@crossbell/util-hooks"
import NextNProgress from "nextjs-progressbar"
import { Network } from "crossbell.js"

import { IPFS_GATEWAY } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { connectors, provider } from "~/lib/wallet-config"
import { createIDBPersister } from "~/lib/persister.client"

import { NotificationModal } from "@crossbell/notification"

Network.setIpfsGateway(IPFS_GATEWAY)

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
})

const persister = createIDBPersister()

try {
  if (typeof window !== "undefined") {
    navigator.serviceWorker?.getRegistrations?.().then((registrations) => {
      registrations?.forEach((registration) => {
        registration.unregister()
      })
    })
  }
} catch (error) {
  console.warn(error)
}

function MyApp({ Component, pageProps }: any) {
  const getLayout = Component.getLayout ?? ((page: any) => page)
  const connectModal = useConnectModal()
  const upgradeAccountModal = useUpgradeAccountModal()
  const [isEmailConnected, characterId] = useAccountState((s) => [
    !!s.email,
    s.computed.account?.characterId,
  ])
  const getCurrentCharacterId = useRefCallback(() => characterId ?? null)

  return (
    <WagmiConfig client={wagmiClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <ConnectKitProvider ipfsLinkToHttpLink={toGateway}>
          <InitContractProvider
            openFaucetHintModel={() => {
              console.log("openFaucetHintModel")
              // FIXME: - openFaucetHintModel
            }}
            openMintNewCharacterModel={() => {
              console.log("openMintNewCharacterModel")
              // FIXME: - openMintNewCharacterModel
            }}
            openConnectModal={
              isEmailConnected ? upgradeAccountModal.show : connectModal.show
            }
            getCurrentCharacterId={getCurrentCharacterId}
          >
            <Hydrate state={pageProps.dehydratedState}>
              <ReactQueryDevtools />
              <NextNProgress
                options={{ easing: "linear", speed: 500, trickleSpeed: 100 }}
              />
              {getLayout(<Component {...pageProps} />)}
              <Toaster />
              <NotificationModal />
            </Hydrate>
          </InitContractProvider>
        </ConnectKitProvider>
      </PersistQueryClientProvider>
    </WagmiConfig>
  )
}

// Only uncomment this method if you have blocking data requirements for
// every single page in your application. This disables the ability to
// perform automatic static optimization, causing every page in your app to
// be server-side rendered.
//
// MyApp.getInitialProps = async (appContext) => {
//   // calls page's `getInitialProps` and fills `appProps.pageProps`
//   const appProps = await App.getInitialProps(appContext);
//
//   return { ...appProps }
// }

export default MyApp
