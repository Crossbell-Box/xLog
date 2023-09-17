import Link from "next/link"

import { Image } from "~/components/ui/Image"
import { Tooltip } from "~/components/ui/Tooltip"
import { ExpandedNote } from "~/lib/types"
import { cn } from "~/lib/utils"

export default function ShortList({
  shorts,
}: {
  shorts: {
    list: ExpandedNote[]
    count: number
    cursor: string | null
  }
}) {
  if (!shorts) return null

  return (
    <>
      <div
        className={cn(
          "xlog-shorts-preview grid gap-3 grid-cols-4 sm:grid-cols-8 relative",
        )}
      >
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
              className="inline-block w-full h-full"
            >
              <Image
                className="object-cover w-full h-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out rounded-full"
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
          label="More Shorts"
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
    </>
  )
}
