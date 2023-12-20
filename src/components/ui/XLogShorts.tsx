"use client"

import { useLocale } from "next-intl"
import React, { FC, useCallback } from "react"

import { Language } from "~/lib/types"
import { cn, isMobileDevice } from "~/lib/utils"
import { useGetPage } from "~/queries/page"
import { useGetSite } from "~/queries/site"

import { Time } from "../common/Time"
import PostCover from "../home/PostCover"
import { Avatar } from "./Avatar"

const XLogShorts: FC<{ slug: string; handle: string }> = ({ slug, handle }) => {
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

  const images = page.data?.metadata?.content?.attachments
    ?.filter((attachment) => attachment.name === "image")
    .map((img) => img.address || "")
    .filter(Boolean)

  const isMobile = isMobileDevice()
  const [isExpanded, setIsExpanded] = React.useState(false)

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  if (page.isLoading) return <div>Loading...</div>

  return (
    <div
      onClick={toggleExpand}
      className={cn(
        "flex flex-col md:flex-row w-full bg-zinc-50 rounded-xl p-4 gap-x-4 hover:cursor-pointer",
        isExpanded ? "sm:h-[350px]" : "sm:h-[150px]",
        "transition-height duration-500 ease-in-out",
      )}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full h-full mb-2 sm:mb-0 align-middle flex items-center justify-center",
          isExpanded ? "sm:w-[350px]" : "sm:w-[150px]",
          "transition-width duration-500 ease-in-out",
        )}
      >
        <PostCover
          uniqueKey={`short-${page.data?.characterId}-${page.data?.noteId}`}
          images={images}
          title={page.data?.metadata?.content?.title}
          className="rounded-lg w-full aspect-auto border-b-0 h-full"
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
            <p className={`line-clamp-${isExpanded || isMobile ? 6 : 1}`}>
              {page.data?.metadata?.content?.content}
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
                "i-mingcute-arrows-down-line text-xl ml-[2px] text-accent",
                isExpanded ? "rotate-180" : "rotate-0",
                "transition-transform duration-500 ease-in-out",
                "hidden sm:inline-block",
              )}
            />
          </span>
        </div>
      </div>
    </div>
  )
}

export default XLogShorts
