"use client"

import { useTranslations } from "next-intl"
import Link from "next/link"

import { Image } from "~/components/ui/Image"
import { Tooltip } from "~/components/ui/Tooltip"
import { useIsMobileLayout } from "~/hooks/useMobileLayout"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

export default function ShortList({
  shorts,
  className,
  isHome,
}: {
  shorts: {
    list: ExpandedNote[]
    count?: number
    cursor?: string | null
  }
  className?: string
  isHome?: boolean
}) {
  const t = useTranslations()

  const isMobileLayout = useIsMobileLayout()

  if (!shorts) return null

  return (
    <>
      <div
        className={cn(
          "xlog-shorts-preview space-y-3 border-b border-zinc-100 pb-6 mb-6",
          className,
        )}
      >
        <Link href="/shorts">
          <h2 className="flex items-center font-bold text-lg">
            <i className="i-mingcute-ins-line mr-1" />
            {t("Shorts")}
          </h2>
        </Link>
        <div className="grid gap-3 grid-cols-4 sm:grid-cols-8 relative">
          {shorts.list.map((post) => (
            <Tooltip
              key={`${post.characterId}-${post.noteId}`}
              label={
                post.metadata?.content?.title ||
                post.metadata?.content?.summary ||
                ""
              }
              className="max-w-lg truncate"
              childrenClassName="aspect-square"
            >
              <Link
                href={
                  (isHome
                    ? isMobileLayout
                      ? `/site/${
                          post.toNote?.character?.handle ||
                          post?.character?.handle
                        }`
                      : `/post/${
                          post.toNote?.character?.handle ||
                          post?.character?.handle
                        }`
                    : "") + `/${post.metadata?.content?.slug}`
                }
                className="inline-block size-full rounded-2xl overflow-hidden"
              >
                <Image
                  className="object-cover size-full sm:hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
                  alt="cover"
                  src={post.metadata?.content.images?.[0] || ""}
                  width={170}
                  height={170}
                  priority
                ></Image>
              </Link>
            </Tooltip>
          ))}
          <Tooltip
            label={t("More shorts")}
            childrenClassName="absolute top-1/2 -translate-y-1/2 right-2"
          >
            <Link
              href="/shorts"
              className="bg-white rounded-full z-[1] size-8 flex items-center justify-center"
            >
              <i className="i-mingcute-right-fill" />
            </Link>
          </Tooltip>
        </div>
      </div>
    </>
  )
}
