const namespace = "xlog"

let data: {
  [key: string]: any
} = {}
try {
  data = JSON.parse(localStorage.getItem(namespace) || "{}")
} catch (error) {}

export const getKeys = (key: string | string[]) => {
  return Object.keys(data).filter((k) => {
    if (typeof key === "string") {
      return k.startsWith(key)
    } else {
      return key.some((item) => k.startsWith(item))
    }
  })
}

export const getStorage = (key: string, noCache?: boolean) => {
  if (noCache) {
    try {
      data = JSON.parse(localStorage.getItem(namespace) || "{}")
    } catch (error) {}
  }
  return data[key]
}

export const setStorage = (key: string, value: any) => {
  data[key] =
    typeof value !== "object" ? value : Object.assign({}, data[key], value)
  localStorage.setItem(namespace, JSON.stringify(data))
}

export const delStorage = (key: string) => {
  delete data[key]
  localStorage.setItem(namespace, JSON.stringify(data))
}
