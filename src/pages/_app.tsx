import { Toaster } from "react-hot-toast"
import LoginModal from "~/components/common/LoginModal"
import "~/css/main.css"
import "~/generated/uno.css"
import { StoreProvider, createStore } from "~/lib/store"
import { wrapTrpc } from "~/lib/trpc"
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

import '@rainbow-me/rainbowkit/styles.css'

const { chains, provider } = configureChains(
  [{
    id: 3737,
    name: 'Crossbell',
    network: 'crossbell',
    rpcUrls: {
      default: 'https://rpc.crossbell.io',
    },
    iconUrl: 'https://gateway.ipfs.io/ipfs/QmS8zEetTb6pwdNpVjv5bz55BXiSMGP9BjTJmNcjcUT91t',
    nativeCurrency: {
      decimals: 18,
      name: 'Crossbell Token',
      symbol: 'CSB',
    },
    blockExplorers: {
      default: { name: 'Crossbell Explorer', url: 'https://scan.crossbell.io' },
    },
    testnet: false,
  } as any],
  [
    jsonRpcProvider({ rpc: chain => ({ http: chain.rpcUrls.default }) })
  ]
)

const { connectors } = getDefaultWallets({
  appName: 'Crosslog',
  chains
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function MyApp({ Component, pageProps }: any) {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <StoreProvider createStore={createStore}>
          <Component {...pageProps} />
          <LoginModal />
          <Toaster />
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

export default wrapTrpc()(MyApp)
