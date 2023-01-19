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
import { UrlComposer } from "@crossbell/ui"

import { InitContractProvider } from "@crossbell/contract"
import { useRefCallback } from "@crossbell/util-hooks"
import NextNProgress from "nextjs-progressbar"
import { CharacterEntity, Network } from "crossbell.js"

import { IPFS_GATEWAY, CSB_IO } from "~/lib/env"
import { toGateway } from "~/lib/ipfs-parser"
import { connectors, provider } from "~/lib/wallet-config"
import { createIDBPersister } from "~/lib/persister.client"

import { NotificationModal } from "@crossbell/notification"
import { getSiteLink } from "~/lib/helpers"
import type { NoteEntity } from "crossbell.js"

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

const urlComposer: Partial<UrlComposer> = {
  characterUrl: ({ handle }) => getSiteLink({ subdomain: handle }),
  noteUrl: (note) => {
    let originalNote = note
    while (originalNote?.toNote) {
      originalNote = originalNote.toNote
    }

    if (originalNote.metadata?.content?.sources?.includes("xlog")) {
      const { character } = originalNote

      if (character) {
        return (
          getSiteLink({
            subdomain: character.handle,
          }) +
          "/" +
          (
            originalNote.metadata?.content?.attributes?.find(
              (a: any) => a?.trait_type === "xlog_slug",
            )?.value ||
            (originalNote as any).metadata?.content?._xlog_slug ||
            (originalNote as any).metadata?.content?._crosslog_slug
          )?.toLowerCase?.() +
          (originalNote !== note ? `#comments` : "")
        )
      } else {
        return ""
      }
    } else {
      return `${CSB_IO}/notes/${note.characterId}-${note.noteId}`
    }
  },
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
        <ConnectKitProvider
          ipfsLinkToHttpLink={toGateway}
          urlComposer={urlComposer}
        >
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
