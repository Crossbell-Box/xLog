import { GetServerSideProps } from "next"
import { ReactElement, useState } from "react"
import { MainLayout } from "~/components/main/MainLayout"
import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { prefetchGetSites } from "~/queries/site.server"
import showcase from "../../data/showcase.json"
import type { FeedType } from "~/models/home.model"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { languageDetector } from "~/lib/language-detector"
import { MainFeed } from "~/components/main/MainFeed"
import { Tabs } from "~/components/ui/Tabs"
import { MainSidebar } from "~/components/main/MainSidebar"
import { prefetchGetFeed } from "~/queries/home.server"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(showcase, queryClient)
  await prefetchGetFeed(
    {
      type: "latest",
    },
    queryClient,
  )

  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "index",
        "dashboard",
      ])),
      dehydratedState: JSON.parse(JSON.stringify(dehydrate(queryClient))),
    },
  }
}

function Activities() {
  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )
  const connectModal = useConnectModal()

  const [feedType, setFeedType] = useState<FeedType>("latest")
  const tabs = [
    {
      text: "Latest",
      onClick: () => setFeedType("latest"),
      active: feedType === "latest",
    },
    {
      text: "Hottest",
      onClick: () => setFeedType("hot"),
      active: feedType === "hot",
    },
    {
      text: "Following",
      onClick: () => {
        if (!currentCharacterId) {
          connectModal.show()
        } else {
          setFeedType("following")
        }
      },
      active: feedType === "following",
    },
  ]

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <Tabs items={tabs} className="border-none text-lg"></Tabs>
          <MainFeed type={feedType} />
        </div>
        <MainSidebar />
      </div>
    </section>
  )
}

Activities.getLayout = (page: ReactElement) => {
  return <MainLayout>{page}</MainLayout>
}

export default Activities
