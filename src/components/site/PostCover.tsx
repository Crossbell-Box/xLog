import { Image } from "~/components/ui/Image"

export default function PostCover({ cover }: { cover?: string }) {
  if (!cover) return null

  return (
    <>
      <div className="xlog-post-cover rounded-2xl overflow-hidden hidden sm:flex items-center relative h-36 aspect-video mr-8 mt-0">
        <Image
          className="object-cover group-hover:scale-105 transition-transform duration-400 ease-in-out"
          alt="cover"
          src={cover}
          width={256}
          height={256}
        ></Image>
      </div>
      <div className="xlog-post-cover rounded-2xl overflow-hidden flex sm:hidden items-center relative w-full aspect-video mb-4">
        <Image
          className="object-cover"
          alt="cover"
          src={cover}
          width={480}
          height={270}
        ></Image>
      </div>
    </>
  )
}
