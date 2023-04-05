import { GetServerSideProps } from "next"
import { ReactElement, useState } from "react"
import { MainLayout } from "~/components/main/MainLayout"
import { dehydrate, QueryClient } from "@tanstack/react-query"
import { prefetchGetSites } from "~/queries/site.server"
import showcase from "../../../data/showcase.json"
import topics from "../../../data/topics.json"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { languageDetector } from "~/lib/language-detector"
import { MainFeed } from "~/components/main/MainFeed"
import { MainSidebar } from "~/components/main/MainSidebar"
import { useRouter } from "next/router"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  await prefetchGetSites(showcase, queryClient)

  return {
    props: {
      ...(await serverSideTranslations(languageDetector(ctx), [
        "common",
        "index",
        "dashboard",
      ])),
      dehydratedState: dehydrate(queryClient),
    },
  }
}

function Topic() {
  const router = useRouter()
  const topic = router.query.topic as string

  const info = topics.find((t) => t.name === topic)

  return (
    <section className="pt-24">
      <div className="max-w-screen-lg px-5 mx-auto flex">
        <div className="flex-1 min-w-[300px]">
          <h2 className="text-3xl font-bold">Topic: {topic}</h2>
          <p className="text-zinc-400 mt-4">{info?.description}</p>
          <div className="mt-10">
            <MainFeed type="topic" noteIds={info?.notes} />
          </div>
        </div>
        <MainSidebar />
      </div>
    </section>
  )
}

Topic.getLayout = (page: ReactElement) => {
  return <MainLayout>{page}</MainLayout>
}

export default Topic
