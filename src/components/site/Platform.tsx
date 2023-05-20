import { Image } from "~/components/ui/Image"
import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { cn } from "~/lib/utils"

export const PlatformsSyncMap: {
  [key: string]: {
    name: string
    icon: string
    url?: string
    identityFormatTemplate?: string
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
  zhihu: {
    name: "zhihu",
    icon: "/assets/social/zhihu.svg",
    url: "https://www.zhihu.com/people/{username}",
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
  xiaoyuzhou: {
    name: "xiaoyuzhou FM",
    icon: "/assets/social/xiaoyuzhou.png",
    url: "https://www.xiaoyuzhoufm.com/podcast/{username}",
  },
  steam: {
    name: "Steam",
    icon: "/assets/social/steam.svg",
    url: "https://steamcommunity.com/id/{username}",
  },
  gitlab: {
    name: "Gitlab",
    icon: "/assets/social/gitlab.svg",
    url: "https://gitlab.com/{username}",
  },
  keybase: {
    name: "Keybase",
    icon: "/assets/social/keybase.png",
    url: "https://keybase.io/{username}",
  },
  youtube: {
    name: "Youtube",
    icon: "/assets/social/youtube.svg",
    url: "https://youtube.com/@{username}",
  },
  facebook: {
    name: "Facebook",
    icon: "/assets/social/facebook.svg",
    url: "https://facebook.com/{username}",
  },
  whatsapp: {
    name: "Whatsapp",
    icon: "/assets/social/whatsapp.svg",
    url: "https://wa.me/{username}",
  },
  mastodon: {
    name: "Mastodon",
    icon: "/assets/social/mastodon.svg",
    url: "https://{instance}/@{username}",
    identityFormatTemplate: "username@instance.ltd",
  },
  misskey: {
    name: "Misskey",
    icon: "/assets/social/misskey.png",
    url: "https://{instance}/@{username}",
    identityFormatTemplate: "username@instance.ltd",
  },
  pleroma: {
    name: "Pleroma",
    icon: "/assets/social/pleroma.svg",
    url: "https://{instance}/users/{username}",
    identityFormatTemplate: "username@instance.ltd",
  },
}

export const Platform: React.FC<{
  platform: string
  username: string
  className?: string
}> = ({ platform, username, className }) => {
  platform = platform.toLowerCase()
  let link = PlatformsSyncMap[platform]?.url

  switch (platform) {
    case "mastodon":
    case "misskey":
    case "pleroma":
      const [uname, instance] = username?.split("@")
      link = link?.replace("{instance}", instance).replace("{username}", uname)
      break
    default:
      link = link?.replace("{username}", username)
      break
  }

  return (
    <UniLink
      className={cn(
        "inline-flex hover:scale-110 transition-transform ease align-middle",
        className,
      )}
      key={platform}
      href={link}
    >
      <Tooltip
        label={`${PlatformsSyncMap[platform]?.name || platform}: ${username}`}
        className="capitalize"
      >
        <span className="w-6 h-6 inline-block overflow-hidden">
          {PlatformsSyncMap[platform]?.icon ? (
            <Image
              width={24}
              height={24}
              src={PlatformsSyncMap[platform]?.icon}
              alt={platform}
            />
          ) : (
            <span className="rounded-md inline-flex text-white justify-center items-center bg-zinc-300 w-6 h-6">
              <i className="icon-[mingcute--planet-line] text-xl" />
            </span>
          )}
        </span>
      </Tooltip>
    </UniLink>
  )
}
