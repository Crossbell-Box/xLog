import { Image } from "~/components/ui/Image"

export default function PostCover({
  cover,
  priority,
}: {
  cover?: string
  priority?: boolean
}) {
  if (!cover) return null

  return (
    <>
      <div className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center relative w-full aspect-video border-b">
        <Image
          className="object-cover w-full sm:group-hover:scale-105 sm:transition-transform sm:duration-400 sm:ease-in-out"
          alt="cover"
          src={cover}
          width={624}
          height={351}
          priority={priority}
        ></Image>
      </div>
    </>
  )
}
