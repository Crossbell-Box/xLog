import { cn } from "~/lib/utils"

import data from "../../../data/titles.json"
import { Tooltip } from "../ui/Tooltip"

const icons: {
  [key: string]: {
    bg: string
    icon: string
  }
} = {
  "xLog contributor": {
    bg: "bg-zinc-700 text-white",
    icon: "i-mingcute-terminal-line",
  },
  Organization: {
    bg: "bg-sky-700 text-white",
    icon: "i-mingcute-building-1-line",
  },
}

export const Titles = ({ characterId }: { characterId?: number }) => {
  if (!characterId) {
    return null
  }

  const list = data.filter((title) => title.list.includes(characterId))

  if (!list.length) {
    return null
  }

  return (
    <span className="inline-flex">
      {list.map((title) => (
        <Tooltip
          key={title.name}
          label={title.name}
          childrenClassName={cn(
            icons[title.name].bg,
            "inline-flex p-px rounded-sm",
          )}
        >
          <span
            onClick={(e) => {
              e.preventDefault()
              window.open(title.link)
            }}
            className="inline-flex"
          >
            <span className="text-white">
              <i className={cn(icons[title.name].icon, "text-[10px] block")} />
            </span>
          </span>
        </Tooltip>
      ))}
    </span>
  )
}
