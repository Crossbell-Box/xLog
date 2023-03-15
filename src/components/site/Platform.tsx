import { Image } from "~/components/ui/Image"
import { UniLink } from "~/components/ui/UniLink"
import { Tooltip } from "~/components/ui/Tooltip"
import { cn } from "~/lib/utils"

const syncMap: {
  [key: string]: {
    name: string
    icon: string
    url?: string
  }
} = {
  telegram: {
    name: "Telegram",
    icon: "/assets/social/telegram.svg",
    url: "https://t.me/{username}",
  },
  tg_channel: {
    name: "Telegram Channel",
    icon: "/assets/social/telegram.svg",
    url: "https://t.me/{username}",
  },
  twitter: {
    name: "Twitter",
    icon: "/assets/social/twitter.svg",
    url: "https://twitter.com/{username}",
  },
  twitter_id: {
    name: "Twitter",
    icon: "/assets/social/twitter.svg",
    url: "https://twitter.com/i/user/{username}",
  },
  pixiv: {
    name: "Pixiv",
    icon: "/assets/social/pixiv.ico",
    url: "https://www.pixiv.net/users/{username}",
  },
  substack: {
    name: "Substack",
    icon: "/assets/social/substack.svg",
    url: "https://{username}.substack.com/",
  },
  medium: {
    name: "Medium",
    icon: "/assets/social/medium.svg",
    url: "https://medium.com/@{username}",
  },
  github: {
    name: "GitHub",
    icon: "/assets/social/github.svg",
    url: "https://github.com/{username}",
  },
  jike: {
    name: "Jike",
    icon: "/assets/social/jike.png",
    url: "https://web.okjike.com/u/{username}",
  },
  bilibili: {
    name: "bilibili",
    icon: "/assets/social/bilibili.svg",
    url: "https://space.bilibili.com/{username}",
  },
  playstation: {
    name: "PlayStation",
    icon: "/assets/social/playstation.svg",
    url: "https://psnprofiles.com/{username}",
  },
  "nintendo switch": {
    name: "Nintendo Switch",
    icon: "/assets/social/nintendo_switch.svg",
  },
  "discord server": {
    name: "Discord Server",
    icon: "/assets/social/discord.svg",
    url: "https://discord.gg/{username}",
  },
}

export const Platform: React.FC<{
  platform: string
  username: string
  className?: string
}> = ({ platform, username, className }) => {
  platform = platform.toLowerCase()
  return (
    <UniLink
      className={cn(
        "inline-flex hover:scale-110 transition-transform ease align-middle",
        className,
      )}
      key={platform}
      href={syncMap[platform]?.url?.replace("{username}", username)}
    >
      <Tooltip
        label={`${syncMap[platform]?.name || platform}: ${username}`}
        className="capitalize"
      >
        <span className="w-6 h-6 inline-block overflow-hidden">
          {syncMap[platform]?.icon ? (
            <Image fill src={syncMap[platform]?.icon} alt={platform} />
          ) : (
            <span className="rounded-md inline-flex text-white justify-center items-center bg-zinc-300 w-6 h-6">
              <i className="i-mingcute:planet-line text-xl" />
            </span>
          )}
        </span>
      </Tooltip>
    </UniLink>
  )
}
