import { Toaster } from "react-hot-toast"
import "~/css/main.css"
import "~/generated/uno.css"
import { StoreProvider, createStore } from "~/lib/store"
import { IpfsGatewayContext } from "@crossbell/ipfs-react"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"
import { configureChains, createClient, WagmiConfig } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client"
import { createIDBPersister } from "~/lib/persister.client"
import { connectorsForWallets, wallet } from "@rainbow-me/rainbowkit"
import { CSB_SCAN, IPFS_GATEWAY } from "~/lib/env"
import { ipfsGateway } from "~/lib/ipfs-gateway"

import "@rainbow-me/rainbowkit/styles.css"

const { chains, provider } = configureChains(
  [
    {
      id: 3737,
      name: "Crossbell",
      network: "crossbell",
      rpcUrls: {
        default: "https://rpc.crossbell.io",
      },
      iconUrl: `${IPFS_GATEWAY}QmS8zEetTb6pwdNpVjv5bz55BXiSMGP9BjTJmNcjcUT91t`,
      nativeCurrency: {
        decimals: 18,
        name: "Crossbell Token",
        symbol: "CSB",
      },
      blockExplorers: {
        default: {
          name: "Crossbell Explorer",
          url: CSB_SCAN,
        },
      },
      testnet: false,
    } as any,
  ],
  [jsonRpcProvider({ rpc: (chain) => ({ http: chain.rpcUrls.default }) })],
)

const connectors = connectorsForWallets([
  {
    groupName: "Recommended",
    wallets: [wallet.metaMask({ chains }), wallet.walletConnect({ chains })],
  },
])

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

function MyApp({ Component, pageProps }: any) {
  const getLayout = Component.getLayout ?? ((page: any) => page)

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <StoreProvider createStore={createStore}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister }}
          >
            <Hydrate state={pageProps.dehydratedState}>
              <ReactQueryDevtools />
              <IpfsGatewayContext.Provider value={ipfsGateway}>
                {getLayout(<Component {...pageProps} />)}
              </IpfsGatewayContext.Provider>
              <Toaster />
            </Hydrate>
          </PersistQueryClientProvider>
        </StoreProvider>
      </RainbowKitProvider>
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
