import uniqolor from "uniqolor"

import { Image } from "~/components/ui/Image"

export default function PostCover({
  cover,
  priority,
  title,
}: {
  cover?: string
  priority?: boolean
  title?: string
}) {
  if (!cover) {
    if (title) {
      const bgAccent = uniqolor(title, {
        saturation: [30, 35],
        lightness: [60, 70],
      }).color

      const bgAccentLight = uniqolor(title, {
        saturation: [30, 35],
        lightness: [80, 90],
      }).color

      const bgAccentUltraLight = uniqolor(title, {
        saturation: [30, 35],
        lightness: [95, 96],
      }).color

      return (
        <>
          <div
            className="xlog-post-cover rounded-t-2xl overflow-hidden flex items-center justify-center text-center relative w-full aspect-video border-b p-2"
            style={{
              background: `linear-gradient(37deg, ${bgAccent} 27.82%, ${bgAccentLight} 79.68%, ${bgAccentUltraLight} 100%)`,
            }}
          >
            <div className="text-white text-xl font-bold">{title}</div>
          </div>
        </>
      )
    } else {
      return null
    }
  }

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
