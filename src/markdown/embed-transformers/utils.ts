export const isHostIncludes = (domain: string, host: string) => {
  return [domain, `www.${domain}`].includes(host)
}

export const includesSomeOfArray = (string: string, array: string[]) =>
  array.some((item) => string.includes(item))

export const iframeStyle =
  'style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;"'
