import { IS_PROD } from "./constants"
import { OUR_DOMAIN } from "./env"

export const getSiteLink = ({ subdomain }: { subdomain: string }) => {
  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}
