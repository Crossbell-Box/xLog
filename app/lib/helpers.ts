import { IS_PROD, OUR_DOMAIN } from "./config.shared"

export const getSiteLink = ({ subdomain }: { subdomain: string }) => {
  return `${IS_PROD ? "https" : "http"}://${subdomain}.${OUR_DOMAIN}`
}
