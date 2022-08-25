const namespace = "xlog"

let data: {
  [key: string]: any
} = {}
try {
  data = JSON.parse(localStorage.getItem(namespace) || "{}")
} catch (error) {}

export const getKeys = (key: string) => {
  return Object.keys(data).filter((k) => k.startsWith(key))
}

export const getStorage = (key: string) => {
  return data[key]
}

export const setStorage = (key: string, value: any) => {
  data[key] = Object.assign({}, data[key], value)
  localStorage.setItem(namespace, JSON.stringify(data))
}

export const delStorage = (key: string) => {
  delete data[key]
  localStorage.setItem(namespace, JSON.stringify(data))
}
