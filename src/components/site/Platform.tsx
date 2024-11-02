"use client"

import { useDebounceEffect } from "ahooks"
import { useEffect, useState } from "react"

import { Tooltip } from "~/components/ui/Tooltip"
import { UniLink } from "~/components/ui/UniLink"
import { cn } from "~/lib/utils"

const iconCDN = "https://icons.ly"

// There is no need to set this icon if it is available by default `https://cdn.simpleicons.org/${platform}`
export const PlatformsSyncMap: {
  [key: string]: {
    name: string
    icon?: string
    url?: string
    identityFormatTemplate?: string
    portfolioDomain?: string
  }
} = {
  telegram: {
    name: "Telegram",
    url: "https://t.me/{username}",
  },
  tg_channel: {
    name: "Telegram Channel",
    icon: `${iconCDN}/telegram`,
    url: "https://t.me/{username}",
  },
  twitter: {
    name: "X",
    icon: `${iconCDN}/x`,
    url: "https://x.com/{username}",
    portfolioDomain: `https://x.com/`,
  },
  twitter_id: {
    name: "X",
    icon: `${iconCDN}/x`,
    url: "https://x.com/i/user/{username}",
  },
  x: {
    name: "X",
    icon: `${iconCDN}/x/_/fff`,
    url: "https://x.com/{username}",
    portfolioDomain: `https://x.com/`,
  },
  x_id: {
    name: "X",
    icon: `${iconCDN}/x/_/fff`,
    url: "https://x.com/i/user/{username}",
  },
  pixiv: {
    name: "Pixiv",
    url: "https://www.pixiv.net/users/{username}",
    portfolioDomain: `https://www.pixiv.net/`,
  },
  substack: {
    name: "Substack",
    url: "https://{username}.substack.com/",
  },
  medium: {
    name: "Medium",
    url: "https://medium.com/@{username}",
  },
  github: {
    name: "GitHub",
    icon: `${iconCDN}/github/_/fff`,
    url: "https://github.com/{username}",
    portfolioDomain: `https://github.com/`,
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
    portfolioDomain: `https://www.bilibili.com/`,
  },
  zhihu: {
    name: "知乎",
    url: "https://www.zhihu.com/people/{username}",
  },
  playstation: {
    name: "PlayStation",
    url: "https://psnprofiles.com/{username}",
  },
  "nintendo switch": {
    name: "Nintendo Switch",
    icon: `${iconCDN}/nintendoswitch`,
  },
  "discord server": {
    name: "Discord Server",
    icon: `${iconCDN}/discord`,
    url: "https://discord.gg/{username}",
  },
  "discord user": {
    name: "Discord User",
    icon: `${iconCDN}/discord`,
    url: "https://discord.com/users/{username}",
  },
  xiaoyuzhou: {
    name: "小宇宙播客",
    icon: "/assets/social/xiaoyuzhou2.png",
    url: "https://www.xiaoyuzhoufm.com/podcast/{username}",
    portfolioDomain: `https://www.xiaoyuzhoufm.com/`,
  },
  steam: {
    name: "Steam",
    url: "https://steamcommunity.com/id/{username}",
  },
  steam_profiles: {
    name: "Steam",
    icon: `${iconCDN}/steam`,
    url: "https://steamcommunity.com/profiles/{username}",
  },
  gitlab: {
    name: "Gitlab",
    url: "https://gitlab.com/{username}",
  },
  keybase: {
    name: "Keybase",
    url: "https://keybase.io/{username}",
  },
  youtube: {
    name: "Youtube",
    url: "https://youtube.com/@{username}",
    portfolioDomain: `https://youtube.com/`,
  },
  facebook: {
    name: "Facebook",
    url: "https://facebook.com/{username}",
  },
  whatsapp: {
    name: "Whatsapp",
    url: "https://wa.me/{username}",
  },
  mastodon: {
    name: "Mastodon",
    url: "https://{instance}/@{username}",
    identityFormatTemplate: "username@instance.ltd",
  },
  misskey: {
    name: "Misskey",
    url: "https://{instance}/@{username}",
    identityFormatTemplate: "username@instance.ltd",
  },
  pleroma: {
    name: "Pleroma",
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
  "500px": {
    name: "500px",
    url: "https://500px.com/p/{username}",
  },
  threads: {
    name: "Threads",
    icon: `${iconCDN}/threads`,
    url: "https://www.threads.net/@{username}",
  },
  instagram: {
    name: "Instagram",
    icon: `${iconCDN}/instagram`,
    url: "https://www.instagram.com/{username}",
  },
  phaver: {
    name: "Phaver",
    icon: "/assets/social/phaver.png",
    url: "https://phaver.app.link/{username}",
  },
  warpcast: {
    name: "Warpcast",
    icon: `${iconCDN}/farcaster`,
    url: "https://warpcast.com/{username}",
  },
  debank: {
    name: "DeBank",
    icon: "/assets/social/debank.png",
    url: "https://debank.com/profile/{username}",
  },
  bluesky: {
    name: "BlueSky",
    icon: "${iconCDN}/bluesky",
    url: "https://bsky.app/profile/{username}",
  },
    xbox: {
    name: "Xbox",
    url: "https://www.xbox.com/play/user/{username}",
   },
    namemc: {
    name: "NameMC",
    icon: "${iconCDN}/namemc",
    url: "https://namemc.com/profile/{username}.1",
  },
    roblox: {
    name: "Roblox",
    icon: "${iconCDN}/roblox",
    url: "https://www.roblox.com/users/{username}",
  },
    niconico: {
    name: "NicoNico",
    icon: "${iconCDN}/niconico",
    url: "https://www.nicovideo.jp/user/{username}",
  },
    "netease cloud music": {
    name: "Netease Cloud Music",
    icon: "${iconCDN}/neteasecloudmusic",
    url: "https://music.163.com/#/user/home?id={username}",
  },
  "netease cloud music artist": {
    name: "Netease Cloud Music Artist",
    icon: "${iconCDN}/neteasecloudmusic",
    url: "https://music.163.com/#/artist?id={username}",
  },
  "steamdb": {
    name: "SteamDB",
    icon: "${iconCDN}/steamdb",
    url: "https://steamdb.info/calculator/{username}",
  },
  follow: {
    name: "Follow",
    icon: "/assets/social/follow.svg",
    url: "https://app.follow.is/share/users/{username}",
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

  const [debouncePlatform, setDebouncePlatform] = useState(platform)
  useDebounceEffect(
    () => {
      setDebouncePlatform(platform)
    },
    [platform],
    { wait: 500 },
  )

  let link = PlatformsSyncMap[debouncePlatform]?.url

  switch (debouncePlatform) {
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

  const [showImg, setShowImg] = useState(true)

  useEffect(() => {
    setShowImg(true)
  }, [debouncePlatform])

  return (
    <UniLink
      className={cn(
        "size-5 inline-flex hover:scale-110 ease align-middle mr-3 sm:mr-6 transition-transform",
        className,
      )}
      key={debouncePlatform + username}
      href={link}
    >
      <Tooltip
        label={`${PlatformsSyncMap[debouncePlatform]?.name || debouncePlatform}: ${username}`}
        className="text-sm"
      >
        <span className="inline-flex items-center">
          {showImg ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                PlatformsSyncMap[debouncePlatform]?.icon ||
                `${iconCDN}/${debouncePlatform}`
              }
              alt={debouncePlatform}
              width={20}
              height={20}
              onError={() => setShowImg(false)}
            />
          ) : (
            <span className="rounded-md inline-flex text-white justify-center items-center bg-zinc-300">
              <i className="i-mingcute-planet-line text-xl" />
            </span>
          )}
        </span>
      </Tooltip>
    </UniLink>
  )
}
