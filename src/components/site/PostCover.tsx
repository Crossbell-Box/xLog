import { Image } from "~/components/ui/Image"

export default function PostMeta({ cover }: { cover?: string }) {
  if (!cover) return null

  return (
    <>
      <div className="xlog-post-cover hidden sm:flex items-center relative sm:w-28 sm:h-28 mt-2 sm:ml-4 sm:mt-0">
        <Image
          className="object-cover rounded"
          alt="cover"
          src={cover}
          width={192}
          height={192}
        ></Image>
      </div>
      <div className="xlog-post-cover flex sm:hidden items-center relative w-full h-40 mt-2 sm:ml-4 sm:mt-0">
        <Image
          className="object-cover rounded"
          alt="cover"
          src={cover}
          width={350}
          height={160}
        ></Image>
      </div>
    </>
  )
}
