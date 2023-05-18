const api = "https://api.i-meto.com/meting/api"

interface Meta {
  server: string
  type: string
  id: string
}

export interface MetingAudio {
  author: string
  lrc: string
  pic: string
  title: string
  url: string
}

export const parseLink = (url: string) => {
  let rules = [
    ["music.163.com.*song.*id=(\\d+)", "netease", "song"],
    ["music.163.com.*album.*id=(\\d+)", "netease", "album"],
    ["music.163.com.*artist.*id=(\\d+)", "netease", "artist"],
    ["music.163.com.*playlist.*id=(\\d+)", "netease", "playlist"],
    ["music.163.com.*discover/toplist.*id=(\\d+)", "netease", "playlist"],
    ["y.qq.com.*song/(\\w+).html", "tencent", "song"],
    ["y.qq.com.*album/(\\w+).html", "tencent", "album"],
    ["y.qq.com.*singer/(\\w+).html", "tencent", "artist"],
    ["y.qq.com.*playsquare/(\\w+).html", "tencent", "playlist"],
    ["y.qq.com.*playlist/(\\w+).html", "tencent", "playlist"],
  ]
  for (let rule of rules) {
    let patt = new RegExp(rule[0])
    let res = patt.exec(url)
    if (res !== null) {
      return {
        server: rule[1],
        type: rule[2],
        id: res[1],
      }
    }
  }
}

export const fetchAudioData = async (meta: Record<string, string>) => {
  const searchParams = new URLSearchParams(meta)
  searchParams.set("r", Math.random() + "")
  const response = await fetch(api + "?" + searchParams.toString())
  if (response.ok) {
    const json = (await response.json()) as MetingAudio[]
    if (json.length === 0) {
      throw new Error(
        "Fetch music data failed, please ensure your url is correct",
      )
    }
    return json
  } else {
    throw new Error(
      "Fetch music data failed, please ensure your url is correct",
    )
  }
}
