import type { Transformer } from "../rehype-embed"
import { generateIframeHTML, isHostIncludes } from "./utils"

export const CodeSandboxTransformer: Transformer = {
  name: "CodeSandbox",
  shouldTransform(url) {
    const { host, pathname } = url

    return isHostIncludes("codesandbox.io", host) && pathname.includes("/s/")
  },
  getHTML(url) {
    return generateIframeHTML({
      name: "codesandbox",
      src: url.toString().replace("/s/", "/embed/"),
      ratio: "16 / 9",
      allow:
        "accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking",
      sandbox:
        "allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts",
    })
  },
}
