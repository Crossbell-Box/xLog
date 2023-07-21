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
    name: "即刻",
    icon: "/assets/social/jike.png",
    url: "https://web.okjike.com/u/{username}",
  },
  bilibili: {
    name: "bilibili",
    icon: "/assets/social/bilibili.svg",
    url: "https://space.bilibili.com/{username}",
  },
  zhihu: {
    name: "知乎",
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
    name: "小宇宙播客",
    icon: "/assets/social/xiaoyuzhou2.png",
    url: "https://www.xiaoyuzhoufm.com/podcast/{username}",
  },
  steam: {
    name: "Steam",
    icon: "/assets/social/steam.svg",
    url: "https://steamcommunity.com/id/{username}",
  },
  steam_profiles: {
    name: "Steam",
    icon: "/assets/social/steam.svg",
    url: "https://steamcommunity.com/profiles/{username}",
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
  douban: {
    name: "豆瓣",
    icon: "/assets/social/douban.png",
    url: "https://www.douban.com/people/{username}",
  },
  email: {
    name: "Email",
    icon: "/assets/social/email.png",
    url: "mailto:{username}",
  },
}

export const Platform = ({
  platform,
  username,
  className,
}: {
  platform: string
  username: string
  className?: string
}) => {
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
        "w-5 h-5 inline-flex hover:scale-110 ease align-middle mr-3 sm:mr-6 transition-transform",
        className,
      )}
      key={platform + username}
      href={link}
    >
      <Tooltip
        label={`${PlatformsSyncMap[platform]?.name || platform}: ${username}`}
        className="text-sm"
      >
        <span className="inline-flex items-center">
          {PlatformsSyncMap[platform]?.icon ? (
            <Image
              src={PlatformsSyncMap[platform]?.icon}
              alt={platform}
              width={20}
              height={20}
            />
          ) : (
            <span className="rounded-md inline-flex text-white justify-center items-center bg-zinc-300">
              <i className="icon-[mingcute--planet-line] text-xl" />
            </span>
          )}
        </span>
      </Tooltip>
    </UniLink>
  )
}
