"use client"

import { CharacterEntity } from "crossbell"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { memo } from "react"
import reactStringReplace from "react-string-replace"

import { CharacterFloatCard } from "~/components/common/CharacterFloatCard"
import { FormattedNumber } from "~/components/common/FormattedNumber"
import { Titles } from "~/components/common/Titles"
import PostCover from "~/components/home/PostCover"
import { PlatformsSyncMap } from "~/components/site/Platform"
import { Avatar } from "~/components/ui/Avatar"
import { Tooltip } from "~/components/ui/Tooltip"
import { useDate } from "~/hooks/useDate"
import { getSiteLink } from "~/lib/helpers"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

const Card = ({
  character,
  post,
  keyword,
  comment,
  createdAt,
  isPinned,
  linkPrefix,
  isBlank,
  showPublishTime,
  isShort,
}: {
  character?: CharacterEntity
  post: ExpandedNote
  keyword?: string
  comment?: string
  createdAt?: string
  isPinned?: boolean
  linkPrefix?: string
  isBlank?: boolean
  showPublishTime?: boolean
  isShort?: boolean
}) => {
  const router = useRouter()
  const t = useTranslations()
  const date = useDate()
  const searchParams = useSearchParams()

  let queryString = searchParams.toString()
  queryString = queryString ? `?${queryString}` : ""

  const isPortfolio = post.metadata?.content?.tags?.[0] === "portfolio"
  const externalLink = post.metadata?.content?.external_urls?.[0]
  const platform = Object.values(PlatformsSyncMap).find(
    (p) => p.portfolioDomain && externalLink?.startsWith(p.portfolioDomain),
  )

  return (
    <Link
      target={isBlank || isPortfolio ? "_blank" : undefined}
      href={
        isPortfolio
          ? externalLink || ""
          : `${linkPrefix || ""}/${post.metadata?.content?.slug}${queryString}`
      }
      scroll={!linkPrefix}
      className={cn(
        "xlog-post rounded-2xl flex flex-col items-center group relative",
        isShort
          ? "xlog-short"
          : "border sm:hover:bg-hover transition-all hover:opacity-100",
      )}
    >
      <PostCover
        uniqueKey={`${post.characterId}-${post.noteId}`}
        images={post.metadata?.content?.images}
        title={post.metadata?.content?.title}
        className={isShort ? "rounded-b-2xl aspect-square border-b-0" : ""}
      />
      <div
        className={cn(
          "px-3 py-2 w-full min-w-0 flex flex-col text-sm",
          isShort
            ? "space-y-2 h-auto sm:h-[84px]" // 8 * 2 + 8 + 40 + 20
            : "space-y-2 sm:px-5 sm:py-4 h-auto sm:h-[163px]", // 16 * 2 + 8 * 2 + 75 + 20 + 20
        )}
      >
        <div
          className={cn(
            isShort
              ? "line-clamp-2 max-h-10"
              : "space-y-2 line-clamp-3 h-[75px]",
          )}
        >
          {comment && (
            <div className="font-medium text-zinc-700 line-clamp-2">
              <i className="i-mingcute-comment-fill mr-2" />
              {comment}
            </div>
          )}
          {!!post.metadata?.content?.images?.length &&
            post.metadata?.content?.title && (
              <h2
                className={cn(
                  "xlog-post-title font-bold",
                  comment ? "text-zinc-500" : "text-zinc-700",
                  isShort ? "" : "text-base",
                )}
              >
                {post.metadata?.content?.title}
              </h2>
            )}
          {!comment && (
            <div
              className={cn(
                "xlog-post-excerpt text-zinc-500",
                isShort ? "line-clamp-2" : "line-clamp-3",
              )}
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
            </div>
          )}
        </div>
        {!isShort && (
          <div className="xlog-post-meta text-zinc-400 flex items-center text-[13px] truncate space-x-2">
            {isPortfolio ? (
              <>
                <Tooltip
                  label={`${platform?.name || platform}`}
                  className="text-sm"
                >
                  <span className="inline-flex items-center space-x-[6px]">
                    {platform?.icon && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={platform?.icon}
                        alt={platform?.name}
                        width={16}
                        height={16}
                      />
                    )}
                    <span>{t("Portfolio")}</span>
                  </span>
                </Tooltip>
                {!!post.stat?.portfolio?.videoViewsCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-youtube-line mr-[2px] text-base" />
                    <FormattedNumber
                      value={post.stat.portfolio.videoViewsCount}
                    />
                  </span>
                )}
                {!!post.stat?.portfolio?.audioListensCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-headphone-line mr-[2px] text-base" />
                    <FormattedNumber
                      value={post.stat.portfolio.audioListensCount}
                    />
                  </span>
                )}
                {!!post.stat?.portfolio?.projectStarsCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-star-line mr-[2px] text-base" />
                    <FormattedNumber
                      value={post.stat.portfolio.projectStarsCount}
                    />
                  </span>
                )}
                {!!post.stat?.portfolio?.textViewsCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-eye-line mr-[2px] text-base" />
                    <FormattedNumber
                      value={post.stat.portfolio.textViewsCount}
                    />
                  </span>
                )}
                {!!post.stat?.portfolio?.commentsCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-comment-line mr-[2px] text-base" />
                    <FormattedNumber
                      value={post.stat.portfolio.commentsCount}
                    />
                  </span>
                )}
              </>
            ) : (
              <>
                {!!post.metadata?.content?.tags?.[1] && (
                  <span
                    className="xlog-post-tags hover:text-zinc-600 hover:bg-zinc-200 border transition-colors text-zinc-500 inline-flex items-center bg-zinc-100 rounded-full px-2 py-[1.5px] truncate text-xs sm:text-[13px] h-5"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push(`/tag/${post.metadata?.content?.tags?.[1]}`)
                    }}
                  >
                    <i className="i-mingcute-tag-line mr-[2px]" />
                    {post.metadata?.content?.tags?.[1]}
                  </span>
                )}
                {!isShort && !!post.stat?.viewDetailCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-eye-line mr-[2px] text-base" />
                    <FormattedNumber value={post.stat?.viewDetailCount} />
                  </span>
                )}
                {!!post.stat?.commentsCount && (
                  <span className="xlog-post-views inline-flex items-center">
                    <i className="i-mingcute-comment-line mr-[2px] text-base" />
                    <FormattedNumber value={post.stat.commentsCount} />
                  </span>
                )}
                {!post.stat?.commentsCount && (
                  <span className="xlog-post-word-count sm:inline-flex items-center hidden">
                    <i className="i-mingcute-sandglass-line mr-[2px] text-sm" />
                    <span
                      style={{
                        wordSpacing: "-.2ch",
                      }}
                    >
                      {post.metadata?.content?.readingTime} {t("min")}
                    </span>
                  </span>
                )}
              </>
            )}
          </div>
        )}
        <div
          className={cn(
            "flex items-center space-x-1 text-xs sm:text-sm overflow-hidden",
            isShort && !character && "!mt-1",
          )}
        >
          {character && (
            <>
              <CharacterFloatCard siteId={character?.handle}>
                <span
                  className="flex items-center cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(
                      `${getSiteLink({
                        subdomain: character?.handle || "",
                      })}`,
                    )
                  }}
                >
                  <span className="size-5 inline-block mr-[6px]">
                    <Avatar
                      cid={character?.characterId}
                      images={character?.metadata?.content?.avatars || []}
                      size={20}
                      name={character?.metadata?.content?.name}
                    ></Avatar>
                  </span>
                  <span className="font-medium truncate text-zinc-600">
                    {character?.metadata?.content?.name || character?.handle}
                  </span>
                </span>
              </CharacterFloatCard>
              <Titles characterId={+character?.characterId} />
              {!isShort && (
                <span className="text-zinc-400 hidden sm:inline-block">·</span>
              )}
            </>
          )}
          {isShort && (
            <span className="xlog-post-meta text-zinc-400 flex items-center text-[13px] truncate space-x-2 !ml-2">
              {!!post.stat?.likesCount && (
                <span className="xlog-post-views inline-flex items-center">
                  <i className="i-mingcute-thumb-up-2-line mr-[2px] text-base" />
                  <FormattedNumber value={post.stat?.likesCount} />
                </span>
              )}
              {!!post.stat?.commentsCount && (
                <span className="xlog-post-views inline-flex items-center">
                  <i className="i-mingcute-comment-line mr-[2px] text-base" />
                  <FormattedNumber value={post.stat?.commentsCount} />
                </span>
              )}
            </span>
          )}
          {!isShort && (
            <time
              dateTime={date.formatToISO(
                (showPublishTime && post.metadata?.content?.date_published) ||
                  createdAt ||
                  post.createdAt,
              )}
              className="xlog-post-date whitespace-nowrap text-zinc-400 hidden sm:inline-block"
            >
              {t("ago", {
                time: date.dayjs
                  .duration(
                    date
                      .dayjs(
                        (showPublishTime &&
                          post.metadata?.content?.date_published) ||
                          createdAt ||
                          post.createdAt,
                      )
                      .diff(date.dayjs(), "minute"),
                    "minute",
                  )
                  .humanize(),
              })}
            </time>
          )}
        </div>
      </div>
      {isPinned && (
        <span className="absolute top-2 right-2 text-xs border transition-colors text-zinc-500 inline-flex items-center bg-zinc-100 rounded-full px-2 py-[1.5px]">
          <i className="i-mingcute-pin-2-fill mr-1" />
          {t("Pinned")}
        </span>
      )}
    </Link>
  )
}

const Post = ({
  post,
  keyword,
  isPinned,
  linkPrefix,
  isBlank,
  showPublishTime,
  isShort,
}: {
  post: ExpandedNote
  keyword?: string
  isPinned?: boolean
  linkPrefix?: string
  isBlank?: boolean
  showPublishTime?: boolean
  isShort?: boolean
}) => {
  let isComment
  if (post.metadata?.content?.tags?.includes("comment") && post.toNote) {
    isComment = true
  }

  return (
    <Card
      character={post.character || undefined}
      post={isComment ? (post.toNote as ExpandedNote) : post}
      keyword={keyword}
      comment={isComment ? post.metadata?.content?.summary : undefined}
      createdAt={isComment ? post?.createdAt : post.toNote?.createdAt}
      isPinned={isPinned}
      linkPrefix={linkPrefix}
      isBlank={isBlank}
      showPublishTime={showPublishTime}
      isShort={isShort}
    />
  )
}

const PostCard = memo(Post)

export default PostCard
