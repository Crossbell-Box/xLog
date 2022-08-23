import { IS_PROD } from "./constants"
import { OUR_DOMAIN } from "./env"

export const getSiteLink = ({
  domain,
  subdomain,
  noProtocol,
}: {
  domain?: string
  subdomain: string
  noProtocol?: boolean
}) => {
  if (domain) {
    return `https://${domain}`
  }
  if (noProtocol) {
    return `${subdomain}.${OUR_DOMAIN}`
  }
  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}
