import { IframeHTMLAttributes } from "react"

interface IframeProps extends IframeHTMLAttributes<HTMLIFrameElement> {
  name: string
}

export const isHostIncludes = (domain: string, host: string) => {
  return [domain, `www.${domain}`].includes(host)
}

export const includesSomeOfArray = (string: string, array: string[]) =>
  array.some((item) => string.includes(item))

export const generateIframeHTML = ({
  name,
  src,
  height,
  width,
  style,
  ...attributes
}: IframeProps) => {
  const iframeStyle =
    'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"'
  const iframeAttributes = Object.entries(attributes)
    .map(([key, value]) => {
      if (key === "allowFullScreen") return key.toLowerCase()
      return `${key.toLowerCase()}="${value}"`
    })
    .join(" ")

  return `<div class="xlog-post-content-${name}" style="position: relative; width: ${width}px; height: ${height}; margin: 1rem auto;">
  <iframe src="${src}" border="0" ${iframeStyle} ${iframeAttributes}></iframe>
</div>`
}
