import { configureChains } from "wagmi"
import { jsonRpcProvider } from "wagmi/providers/jsonRpc"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { CoinbaseWalletConnector } from "wagmi/connectors/coinbaseWallet"
import { InjectedConnector } from "wagmi/connectors/injected"

import { CSB_SCAN, IPFS_GATEWAY, APP_NAME } from "~/lib/env"

export const { chains, provider } = configureChains(
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
  {
    pollingInterval: 1000,
  },
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
