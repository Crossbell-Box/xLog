const isLoadScriptMap: Record<string, "loading" | "loaded"> = {}
const loadingQueueMap: Record<string, [Function, Function][]> = {}
export function loadScript(url: string) {
  return new Promise((resolve, reject) => {
    const status = isLoadScriptMap[url]
    if (status === "loaded") {
      return resolve(null)
    } else if (status === "loading") {
      loadingQueueMap[url] = !loadingQueueMap[url]
        ? [[resolve, reject]]
        : [...loadingQueueMap[url], [resolve, reject]]
      return
    }

    const script = document.createElement("script")
    script.src = url
    script.crossOrigin = "anonymous"

    isLoadScriptMap[url] = "loading"
    script.onload = function () {
      isLoadScriptMap[url] = "loaded"
      resolve(null)
      if (loadingQueueMap[url]) {
        loadingQueueMap[url].forEach(([resolve, reject]) => {
          resolve(null)
        })
        delete loadingQueueMap[url]
      }
    }

    script.onerror = function (e) {
      // this.onload = null here is necessary
      // because even IE9 works not like others
      this.onerror = this.onload = null
      delete isLoadScriptMap[url]
      loadingQueueMap[url].forEach(([resolve, reject]) => {
        reject(e)
      })
      delete loadingQueueMap[url]
      reject(e)
    }

    document.head.appendChild(script)
  })
}
