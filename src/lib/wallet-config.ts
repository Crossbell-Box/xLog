import { configureChains } from "wagmi"
import { crossbell } from "wagmi/chains"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"

import { APP_NAME } from "~/lib/env"

export const { chains, provider } = configureChains(
  [crossbell],
  [
    jsonRpcProvider({
      rpc: () => ({ http: crossbell.rpcUrls.default.http[0] }),
    }),
  ],
  { pollingInterval: 1000 },
)

export const connectors = [
  new InjectedConnector({
    chains,
    options: {
      shimDisconnect: true,
      name: (detectedName) =>
        `Injected (${
          typeof detectedName === "string"
            ? detectedName
            : detectedName.join(", ")
        })`,
    },
  }),
  new MetaMaskConnector({
    chains,
    options: {
      shimDisconnect: true,
      shimChainChangedDisconnect: false,
      UNSTABLE_shimOnConnectSelectAccount: true,
    },
  }),
  new CoinbaseWalletConnector({
    chains,
    options: {
      appName: APP_NAME,
      headlessMode: true,
    },
  }),
  new WalletConnectConnector({
    chains,
    options: {
      qrcode: false,
    },
  }),
]
