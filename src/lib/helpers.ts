import { IS_PROD } from "./constants"
import { OUR_DOMAIN } from "./env"

export const getSiteLink = ({
  subdomain,
  noProtocol,
}: {
  subdomain: string
  noProtocol?: boolean
}) => {
  if (noProtocol) {
    return `${subdomain}.${OUR_DOMAIN}`
  }
  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}
