"use client"

import { useLocale, useTranslations } from "next-intl"
import { useParams, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { VirtuosoGrid } from "react-virtuoso"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { Switch } from "@headlessui/react"

import { Loading } from "~/components/common/Loading"
import PostCard from "~/components/common/PostCard"
import { EmptyState } from "~/components/ui/EmptyState"
import { Skeleton } from "~/components/ui/Skeleton"
import { Tabs } from "~/components/ui/Tabs"
import { Tooltip } from "~/components/ui/Tooltip"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote, Language } from "~/lib/types"
import type { FeedType, SearchType } from "~/models/home.model"
import { useGetFeed } from "~/queries/home"

export const HomeFeed = ({ type }: { type?: FeedType }) => {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const locale = useLocale() as Language

  const currentCharacterId = useAccountState(
    (s) => s.computed.account?.characterId,
  )

  const connectModal = useConnectModal()
  if (type === "following" && !currentCharacterId) {
    connectModal.show()
  }

  const [hotInterval, setHotInterval] = useState(7)
  const [searchType, setSearchType] = useState<SearchType>("latest")

  const params = useParams()
  if (params.topic) {
    params.topic = decodeURIComponent(params.topic as string)
  }

  let feedConfig: Parameters<typeof useGetFeed>[0] = {
    type,
  }

  switch (type) {
    case "following":
      feedConfig = {
        type,
        characterId: currentCharacterId,
      }
      break
    case "topic":
      feedConfig = {
        type,
        topic: params.topic,
      }
      break
    case "hottest":
      feedConfig = {
        type,
        daysInterval: hotInterval,
      }
      break
    case "search":
      feedConfig = {
        type,
        searchKeyword: searchParams?.get("q") || undefined,
        searchType,
      }
      break
    case "tag":
      feedConfig = {
        type,
        tag: decodeURIComponent(params?.tag as string),
      }
      break
  }

  const feed = useGetFeed({
    ...feedConfig,
    translateTo: locale,
  })

  const hasFiltering = type === "latest"

  const [aiFiltering, setAiFiltering] = useState(true)

  useEffect(() => {
    setAiFiltering(getStorage("ai_filtering")?.enabled ?? true)
  }, [])

  const hotTabs = [
    {
      text: "Today",
      onClick: () => setHotInterval(1),
      active: hotInterval === 1,
    },
    {
      text: "This week",
      onClick: () => setHotInterval(7),
      active: hotInterval === 7,
    },
    {
      text: "This month",
      onClick: () => setHotInterval(30),
      active: hotInterval === 30,
    },
    {
      text: "All time",
      onClick: () => setHotInterval(0),
      active: hotInterval === 0,
    },
  ]

  const searchTabs = [
    {
      text: "Latest",
      onClick: () => setSearchType("latest"),
      active: searchType === "latest",
    },
    {
      text: "Hottest",
      onClick: () => setSearchType("hottest"),
      active: searchType === "hottest",
    },
  ]

  const [feedInOne, setFeedInOne] = useState<ExpandedNote[]>(
    feed.data?.pages?.[0]?.list || [],
  )
  useEffect(() => {
    if (feed.data?.pages?.length) {
      setFeedInOne(
        feed.data.pages
          .reduce((acc, cur) => {
            return acc.concat((cur?.list || []) as ExpandedNote[])
          }, [] as ExpandedNote[])
          .filter((post) => {
            if (
              aiFiltering &&
              hasFiltering &&
              post.metadata?.content?.score?.number !== undefined &&
              post.metadata.content.score.number <= 60
            ) {
              return false
            } else {
              return true
            }
          }),
      )
    }
  }, [feed.data?.pages, aiFiltering, hasFiltering])

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const isMobileLayout = useIsMobileLayout()

  return (
    <>
      <div className="space-y-10">
        {hasFiltering && (
          <div className="flex items-center text-zinc-500">
            <i className="i-mingcute-sparkles-line mr-2 text-lg" />
            <span className="mr-1 cursor-default">
              {t("Enable AI Filtering")}
            </span>
            <Tooltip
              label={t(
                "Filter out possible low-quality content based on AI ratings",
              )}
            >
              <i className="i-mingcute-question-line" />
            </Tooltip>
            <Switch
              checked={aiFiltering}
              onChange={(value) => {
                setAiFiltering(value)
                setStorage("ai_filtering", {
                  enabled: value,
                })
              }}
              className={`${
                aiFiltering ? "bg-accent" : "bg-gray-200"
              } ml-5 relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Enable AI Filtering</span>
              <span
                className={`${
                  aiFiltering ? "translate-x-6" : "translate-x-1"
                } inline-block size-4 rounded-full bg-white transition`}
              />
            </Switch>
          </div>
        )}
        {type === "hottest" && (
          <Tabs items={hotTabs} className="border-none text-sm -my-4"></Tabs>
        )}
        {type === "search" && (
          <Tabs items={searchTabs} className="border-none text-sm -my-4"></Tabs>
        )}

        {feed.isLoading ? (
          <FeedSkeleton />
        ) : !feed.data?.pages[0]?.count ? (
          <EmptyState />
        ) : (
          <div className="xlog-posts my-8 min-h-[1177px]">
            <VirtuosoGrid
              initialItemCount={9}
              overscan={2604}
              endReached={() => feed.hasNextPage && feed.fetchNextPage()}
              useWindowScroll
              data={feedInOne}
              totalCount={feed.data?.pages[0]?.count || 0}
              listClassName="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-3"
              itemContent={(index) => {
                const post = feedInOne[index]
                if (!post) return null
                return (
                  <PostCard
                    key={`${post.characterId}-${post.noteId}`}
                    post={post}
                    keyword={searchParams?.get("q") || undefined}
                    linkPrefix={
                      isMobileLayout
                        ? `/site/${
                            post.toNote?.character?.handle ||
                            post?.character?.handle
                          }`
                        : `/post/${
                            post.toNote?.character?.handle ||
                            post?.character?.handle
                          }`
                    }
                    isBlank={isMobileLayout}
                    isShort={type === "shorts"}
                  />
                )
              }}
            ></VirtuosoGrid>

            {feed.isFetching && feed.hasNextPage && isMounted && <Loading />}
          </div>
        )}
      </div>
    </>
  )
}

const FeedSkeleton = () => {
  return (
    <Skeleton.Container
      count={9}
      className="grid gap-3 sm:gap-6 grid-cols-1 sm:grid-cols-3 my-8"
    >
      <div className="rounded-2xl border">
        <Skeleton.Rectangle className="h-auto rounded-t-2xl rounded-b-none w-full aspect-video border-b" />
        <div className="rounded-t-none rounded-b-2xl p-3 pt-2 sm:p-5 sm:pt-4 h-[168px] sm:h-[204px]">
          <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4 text-xs sm:text-sm">
            <span className="flex items-center space-x-1 sm:space-x-2 cursor-pointer">
              <Skeleton.Circle className="!w-5 !h-5 sm:!w-6 sm:!h-6 bg-gray-100 dark:bg-gray-800" />
              <Skeleton.Rectangle className="w-[120px] h-5 bg-gray-100 dark:bg-gray-800"></Skeleton.Rectangle>
            </span>
          </div>
          <Skeleton.Rectangle className="w-full h-28 bg-gray-100 dark:bg-gray-800"></Skeleton.Rectangle>
        </div>
      </div>
    </Skeleton.Container>
  )
}
