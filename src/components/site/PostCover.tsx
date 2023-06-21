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
      <div className="xlog-post-cover rounded-2xl overflow-hidden flex items-center relative w-full sm:w-36 sm:h-36 aspect-video mb-4 sm:mb-0 sm:mr-8">
        <Image
          className="object-cover w-full sm:w-36 sm:group-hover:scale-105 sm:transition-transform sm:duration-400 esm:ase-in-out"
          alt="cover"
          src={cover}
          width={256}
          height={256}
          priority={priority}
        ></Image>
      </div>
    </>
  )
}
