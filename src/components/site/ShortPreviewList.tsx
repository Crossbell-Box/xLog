import Link from "next/link"

import { Image } from "~/components/ui/Image"
import { Tooltip } from "~/components/ui/Tooltip"
import { getTranslation } from "~/lib/i18n"
import { ExpandedNote } from "~/lib/types"

export default async function ShortList({
  shorts,
}: {
  shorts: {
    list: ExpandedNote[]
    count: number
    cursor: string | null
  }
}) {
  const { t } = await getTranslation("site")

  if (!shorts) return null

  return (
    <>
      <div className="xlog-shorts-preview space-y-2 border-b border-zinc-100 pb-8 mb-8 -mt-6">
        <Link href="/shorts">
          <h2 className="flex items-center font-bold text-lg">
            <i className="icon-[mingcute--ins-line] mr-1" />
            {t("Shorts")}
          </h2>
        </Link>
        <div className="grid gap-3 grid-cols-4 sm:grid-cols-8 relative">
          {shorts.list.map((post) => (
            <Tooltip
              key={post.noteId}
              label={
                post.metadata?.content?.title ||
                post.metadata?.content?.summary ||
                ""
              }
              className="max-w-lg truncate"
              childrenClassName="aspect-square"
            >
              <Link
                href={`/${post.metadata?.content?.slug}`}
                className="inline-block w-full h-full rounded-2xl overflow-hidden"
              >
                <Image
                  className="object-cover w-full h-full sm:hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
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
              className="bg-white rounded-full z-[1] w-8 h-8 flex items-center justify-center"
            >
              <i className="icon-[mingcute--right-fill]" />
            </Link>
          </Tooltip>
        </div>
      </div>
    </>
  )
}
