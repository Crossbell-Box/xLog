"use client"

import { CharacterEntity } from "crossbell"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { memo, useEffect, useState } from "react"
import reactStringReplace from "react-string-replace"
import { VirtuosoGrid } from "react-virtuoso"

import { useAccountState, useConnectModal } from "@crossbell/connect-kit"
import { Switch } from "@headlessui/react"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { Titles } from "~/components/common/Titles"
import PostCover from "~/components/home/PostCover"
import { EmptyState } from "~/components/ui/EmptyState"
import { Image } from "~/components/ui/Image"
import { Skeleton } from "~/components/ui/Skeleton"
import { Tabs } from "~/components/ui/Tabs"
import { Tooltip } from "~/components/ui/Tooltip"
import { useDate } from "~/hooks/useDate"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { DEFAULT_AVATAR } from "~/lib/env"
import { getSiteLink } from "~/lib/helpers"
import { useTranslation } from "~/lib/i18n/client"
import { getStorage, setStorage } from "~/lib/storage"
import { ExpandedNote } from "~/lib/types"
import { cn, getStringLength } from "~/lib/utils"
import type { FeedType, SearchType } from "~/models/home.model"
import { useGetFeed } from "~/queries/home"

import topics from "../../../data/topics.json"

const PostCard = ({
  character,
  post,
  keyword,
  comment,
}: {
  character?: CharacterEntity
  post: ExpandedNote
  keyword?: string
  comment?: string
}) => {
  const router = useRouter()
  const { t } = useTranslation("common")
  const date = useDate()
  const isMobileLayout = useIsMobileLayout()

  return (
    <Link
      target={isMobileLayout ? "_blank" : undefined}
      href={
        isMobileLayout
          ? `/site/${post?.character?.handle}/${post.metadata?.content?.slug}`
          : `/post/${post?.character?.handle}/${post.metadata?.content?.slug}`
      }
      className={cn(
        "xlog-post sm:hover:bg-hover transition-all rounded-2xl flex flex-col items-center hover:opacity-100 group border",
      )}
    >
      <PostCover
        cover={
          post.metadata?.content.cover ||
          character?.metadata?.content?.avatars?.[0] ||
          DEFAULT_AVATAR
        }
      />
      <div className="p-3 pt-2 sm:p-5 sm:pt-4 w-full min-w-0 h-[168px] sm:h-[204px] flex flex-col">
        <div className="flex items-center space-x-1 sm:space-x-2 mb-2 sm:mb-4 text-xs sm:text-sm">
          <CharacterFloatCard siteId={character?.handle}>
            <span
              className="flex items-center space-x-1 sm:space-x-2 cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                window.open(
                  `${getSiteLink({
                    subdomain: character?.handle || "",
                  })}`,
                )
              }}
            >
              <span className="w-5 h-5 sm:w-6 sm:h-6 inline-block">
                <Image
                  className="rounded-full object-cover"
                  src={
                    character?.metadata?.content?.avatars?.[0] || DEFAULT_AVATAR
                  }
                  alt={character?.handle || ""}
                  fill
                ></Image>
              </span>
              <span className="font-medium max-w-[60px] truncate">
                {character?.metadata?.content?.name || character?.handle}
              </span>
            </span>
          </CharacterFloatCard>
          <Titles characterId={character?.characterId} />
          <span className="text-zinc-400">·</span>
          <time
            dateTime={date.formatToISO(post.createdAt)}
            className="xlog-post-date whitespace-nowrap text-zinc-400"
          >
            {t("ago", {
              time: date.dayjs
                .duration(
                  date.dayjs(post?.createdAt).diff(date.dayjs(), "minute"),
                  "minute",
                )
                .humanize(),
            })}
          </time>
        </div>
        {comment && (
          <div className="font-medium text-zinc-700 mb-2 line-clamp-2">
            <i className="icon-[mingcute--comment-fill] mr-2" />
            {comment}
          </div>
        )}
        <h2
          className={cn(
            "xlog-post-title font-bold line-clamp-2",
            comment ? "text-zinc-500" : "text-zinc-700 sm:text-xl",
          )}
        >
          {post.metadata?.content?.title}
        </h2>
        {(!!post.metadata?.content?.tags?.filter(
          (tag) => tag !== "post" && tag !== "page",
        ).length ||
          post.stat?.viewDetailCount) && (
          <div className="xlog-post-meta text-sm text-zinc-400 mt-1 space-x-4 flex items-center mr-8">
            <span className="xlog-post-tags space-x-1 truncate min-w-0">
              {post.metadata?.content?.tags
                ?.filter((tag) => tag !== "post" && tag !== "page")
                .map((tag, index) => (
                  <span
                    className="hover:text-zinc-600"
                    key={tag + index}
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/tag/${tag}`)
                    }}
                  >
                    #{tag}
                  </span>
                ))}
            </span>
            {post.stat?.viewDetailCount && (
              <span className="xlog-post-views inline-flex items-center">
                <i className="icon-[mingcute--eye-line] mr-[2px]" />
                <span>{post.stat?.viewDetailCount}</span>
              </span>
            )}
          </div>
        )}
        {!comment && (
          <div
            className="xlog-post-excerpt mt-2 text-zinc-500 line-clamp-2 text-sm"
            style={{
              wordBreak: "break-word",
            }}
          >
            {keyword
              ? reactStringReplace(
                  post.metadata?.content?.summary || "",
                  keyword,
                  (match, i) => (
                    <span key={i} className="bg-yellow-200">
                      {match}
                    </span>
                  ),
                )
              : post.metadata?.content?.summary}
            {post.metadata?.content?.summary && "..."}
          </div>
        )}
      </div>
    </Link>
  )
}

const Post = ({ post, keyword }: { post: ExpandedNote; keyword?: string }) => {
  let isComment
  if (post.metadata?.content?.tags?.includes("comment") && post.toNote) {
    isComment = true
  }

  return (
    <PostCard
      character={post.character || undefined}
      post={isComment ? (post.toNote as ExpandedNote) : post}
      keyword={keyword}
      comment={isComment ? post.metadata?.content?.summary : undefined}
    />
  )
}

const MemoedPost = memo(Post)

export const HomeFeed = ({
  noteIds,
  type,
}: {
  noteIds?: string[]
  type?: FeedType
}) => {
  const { t } = useTranslation("common")
  const searchParams = useSearchParams()

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
    params.topic = decodeURIComponent(params.topic)
  }

  const feed = useGetFeed({
    type,
    characterId: currentCharacterId,
    noteIds: noteIds,
    daysInterval: hotInterval,
    searchKeyword: searchParams?.get("q") || undefined,
    searchType,
    tag: decodeURIComponent(params?.tag),
    topicIncludeKeywords: params.topic
      ? topics.find((t) => t.name === params.topic)?.includeKeywords
      : undefined,
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

  const [feedInOne, setFeedInOne] = useState<ExpandedNote[]>([])
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
              post.metadata?.content?.score?.number !== undefined &&
              post.metadata.content.score.number <= 60
            ) {
              return false
            } else if (
              post.toNote?.metadata?.content?.tags?.includes("comment")
            ) {
              return false
            } else if (
              !post.metadata?.content?.summary ||
              getStringLength(post.metadata.content.summary) < 6
            ) {
              return false
            } else {
              return true
            }
          }),
      )
    }
  }, [feed.data?.pages, aiFiltering])

  return (
    <>
      <div className="space-y-10">
        {hasFiltering && (
          <div className="flex items-center text-zinc-500">
            <i className="icon-[mingcute--android-2-line] mr-2 text-lg" />
            <span className="mr-1 cursor-default">
              {t("Enable AI Filtering")}
            </span>
            <Tooltip
              label={t(
                "Filter out possible low-quality content based on AI ratings.",
              )}
            >
              <i className="icon-[mingcute--question-line]" />
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
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
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
          <div className="xlog-posts my-8">
            <VirtuosoGrid
              overscan={2604}
              endReached={() => feed.hasNextPage && feed.fetchNextPage()}
              useWindowScroll
              data={feedInOne}
              totalCount={feed.data?.pages[0]?.count || 0}
              listClassName="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-3"
              itemContent={(index) => {
                const post = feedInOne[index]
                if (!post) return null
                return (
                  <MemoedPost
                    key={`${post.characterId}-${post.noteId}`}
                    post={post}
                    keyword={searchParams?.get("q") || undefined}
                  />
                )
              }}
            ></VirtuosoGrid>

            {feed.isFetching && feed.hasNextPage && <Loader />}
          </div>
        )}
      </div>
    </>
  )
}

const Loader = () => {
  const { t } = useTranslation("common")
  return (
    <div
      className="relative w-full text-sm text-center py-4 mt-12"
      key={"loading"}
    >
      {t("Loading")} ...
    </div>
  )
}

const FeedSkeleton = () => {
  return (
    <Skeleton.Container
      count={9}
      className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-3"
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
