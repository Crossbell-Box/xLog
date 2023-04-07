import { cn } from "~/lib/utils"
import data from "../../../data/titles.json"
import { Tooltip } from "../ui/Tooltip"
import { UniLink } from "../ui/UniLink"

const icons: {
  [key: string]: {
    bg: string
    icon: string
  }
} = {
  "xLog contributor": {
    bg: "bg-zinc-700 text-white",
    icon: "i-mingcute:terminal-line",
  },
}

export const Titles: React.FC<{
  characterId?: number
}> = ({ characterId }) => {
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
            "inline-flex p-[1px] rounded-sm",
          )}
        >
          <UniLink href={title.link} className="inline-flex">
            <i className={cn(icons[title.name].icon, "text-[10px]")} />
          </UniLink>
        </Tooltip>
      ))}
    </span>
  )
}
