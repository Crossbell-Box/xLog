import { FC } from "react"

import { noopArr } from "~/lib/noop"

import { Avatar } from "./Avatar"

interface AvatarStackProps {
  onClick?: () => void
  avatars: {
    name: string | null | undefined
    images: string[] | null | undefined
    cid: number | null | undefined
  }[]
  count: number

  /**
   * @default 3
   */
  showCount?: number
}
export const AvatarStack: FC<AvatarStackProps> = (props) => {
  const { avatars, count, onClick, showCount = 3 } = props
  return (
    <ul
      className="-space-x-4 cursor-pointer hidden sm:inline-flex"
      onClick={onClick}
    >
      {avatars.slice(0, showCount).map((avatar) => {
        return (
          <li className="inline-block" key={avatar.name}>
            <Avatar
              cid={avatar.cid}
              className="relative align-middle border-2 border-white"
              images={avatar.images || noopArr}
              name={avatar.name || ""}
              size={40}
            />
          </li>
        )
      })}
      {count > showCount && (
        <li className="inline-block">
          <div className="relative align-middle border-2 border-white size-10 rounded-full inline-flex bg-gray-100 items-center justify-center text-gray-400 font-medium">
            +{count - showCount}
          </div>
        </li>
      )}
    </ul>
  )
}
