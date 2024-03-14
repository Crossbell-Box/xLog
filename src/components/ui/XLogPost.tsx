"use client"

import { useLocale } from "next-intl"
import React, { FC, useCallback } from "react"

import { Language } from "~/lib/types"
import { cn, isMobileDevice } from "~/lib/utils"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Loading } from "../common/Loading"
import { Time } from "../common/Time"
import PostCover from "../home/PostCover"
import { Avatar } from "./Avatar"
import { UniLink } from "./UniLink"

interface Props {
  slug: string
  handle: string
  url: string
}

const XLogPost: FC<Props> = ({ slug, handle, url }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const locale = useLocale() as Language
  // https://xlog.app/site/lca/JOoXQKAtZYYFrnzntDlJ6?content_type=shorts
  const site = useGetSite(handle)
  const page = useGetPage({
    characterId: site.data?.characterId,
    slug,
    handle,
    disableAutofill: true,
    translateTo: locale,
  })

  const isMobile = isMobileDevice()
  const images = page.data?.metadata.content.images || []
  const isShort = !!page.data?.metadata?.content?.tags?.includes("short")

  const preventNavigate = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      e.stopPropagation()
      e.preventDefault()
    },
    [],
  )

  const toggleExpand = useCallback(
    (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
      preventNavigate(e)
      setIsExpanded((prev) => !prev)
    },
    [preventNavigate],
  )

  if (page.isLoading) return <Loading />

  return (
    <UniLink href={url} className="!no-underline !text-inherit">
      <div
        className={cn(
          "flex flex-col md:flex-row w-full bg-zinc-50 rounded-xl p-4 gap-x-4 hover:cursor-pointer my-2 transition-all duration-500 ease-in-out",
          isExpanded ? "sm:h-[350px]" : "sm:h-[150px]",
        )}
      >
        <div
          onClick={preventNavigate}
          className={cn(
            "size-full mb-2 sm:mb-0 align-middle flex items-center justify-center transition-all duration-500 ease-in-out",
            isExpanded ? "sm:w-[350px]" : "sm:w-[150px]",
          )}
        >
          <PostCover
            uniqueKey={`short-${page.data?.characterId}-${page.data?.noteId}`}
            images={images}
            title={page.data?.metadata?.content?.title}
            className="rounded-lg size-full aspect-auto border-b-0"
            imgClassName="rounded-lg object-contain"
          />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 flex flex-col overflow-hidden">
            {page.data?.metadata?.content?.title && (
              <div className="font-bold mb-2 text-lg truncate">
                {page.data?.metadata?.content?.title}
              </div>
            )}
            <div className="prose overflow-y-auto">
              <p
                className={
                  isExpanded || isMobile ? "line-clamp-6" : "line-clamp-1"
                }
              >
                {isShort
                  ? page.data?.metadata?.content?.content
                  : page.data?.metadata?.content?.summary}
              </p>
            </div>
          </div>

          <div className="flex flex-row w-full justify-between items-end sm:mt-0 mt-4">
            <span className="text-sm">
              <Time isoString={page.data?.metadata?.content?.date_published} />
            </span>

            <span className="p-2 flex w-auto justify-end items-center transition-colors py-1 rounded-lg">
              <Avatar
                cid={site.data?.characterId}
                className="align-middle"
                images={site.data?.metadata?.content?.avatars || []}
                name={site.data?.metadata?.content?.name}
                size={32}
              />

              <div
                className={`flex-1 flex-col min-w-0 ml-2 max-w-[100px] flex sm:mr-6`}
              >
                <span
                  className={`text-left leading-none font-medium truncate text-gray-600 text-base`}
                  style={{ marginBottom: "0.15rem" }}
                >
                  {site.data?.metadata?.content?.name}
                </span>
                {site.data?.handle && (
                  <span
                    className={`text-left leading-none text-sm truncate text-gray-400`}
                  >
                    {"@" + site.data?.handle}
                  </span>
                )}
              </div>

              <i
                className={cn(
                  "i-mingcute-arrows-down-line text-xl ml-[2px] text-accent hover:cursor-pointer",
                  isExpanded ? "rotate-180" : "rotate-0",
                  "transition-transform duration-500 ease-in-out",
                  "hidden sm:inline-block",
                )}
                onClick={toggleExpand}
              />
            </span>
          </div>
        </div>
      </div>
    </UniLink>
  )
}

export default XLogPost
