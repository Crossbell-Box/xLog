import { DPlayerProps, Player as RcDPlayer } from "rc-dplayer"
import { FC, memo } from "react"
import { ReactElement } from "rehype-react/lib"

import { toGateway } from "~/lib/ipfs-parser"

export const DPlayer: FC<{
  children: ReactElement[]
}> = memo(function DPlayer({ children }) {
  const sources = children.filter(
    (child) =>
      child && typeof child.type === "string" && child.type === "source",
  )

  return (
    <>
      {sources.map((source, idx) => {
        const { src: _src, ...props } = source.props as DPlayerProps

        if (!_src) {
          return <div key={idx} />
        }

        const src = toGateway(_src)

        return (
          <div className="my-8" key={idx}>
            <RcDPlayer src={src} {...props} />
          </div>
        )
      })}
    </>
  )
})

export default DPlayer
