import type { Transformer } from "../rehype-embed"
import { iframeStyle, isHostIncludes } from "./utils"

export const CodeSandboxTransformer: Transformer = {
  name: "CodeSandbox",
  shouldTransform(url) {
    const { host, pathname } = url

    return isHostIncludes("codesandbox.io", host) && pathname.includes("/s/")
  },
  getHTML(url) {
    const iframeUrl = url.toString().replace("/s/", "/embed/")

    return `<div class="xlog-post-content-codesandbox" style="position: relative; width: 100%; height: 500px; margin: 1rem 0;">
    <iframe src="${iframeUrl}" style="width:100%; height:500px; border:0; border-radius: 4px; overflow:hidden;" allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking" sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts" ${iframeStyle}></iframe>
    </div>`
  },
}
