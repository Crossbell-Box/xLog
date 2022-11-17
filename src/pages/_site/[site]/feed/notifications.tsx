import { GetServerSideProps } from "next"
import { fetchGetSite, fetchGetNotifications } from "~/queries/site.server"
import { getSiteLink } from "~/lib/helpers"
import { QueryClient } from "@tanstack/react-query"
import { renderPageContent } from "~/markdown"

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const queryClient = new QueryClient()
  ctx.res.setHeader("Content-Type", "application/feed+json; charset=utf-8")
  ctx.res.setHeader("Access-Control-Allow-Methods", "GET")
  ctx.res.setHeader("Access-Control-Allow-Origin", "*")
  const domainOrSubdomain = ctx.params!.site as string

  const site = await fetchGetSite(domainOrSubdomain, queryClient)
  const notifications = await fetchGetNotifications(
    {
      siteCId: site?.metadata?.proof,
    },
    queryClient,
  )

  const link = getSiteLink({
    subdomain: site.username || "",
  })
  ctx.res.write(
    JSON.stringify({
      version: "https://jsonfeed.org/version/1.1",
      title: "Notifications on " + site.name,
      description: site.description,
      icon: link + site.avatars?.[0],
      home_page_url: link,
      feed_url: `${link}/feed/notifications`,
      items: notifications
        ?.map((notification: any) => {
          let key = ""
          let character
          let message = ""
          let url = ""

          switch (notification.type) {
            case "notes":
              if (
                !notification.toNote.metadata?.content?.sources?.includes(
                  "xlog",
                )
              ) {
                return null
              }
              key =
                "notes" + notification.characterId + "-" + notification.noteId
              character = notification?.character
              message = "commented on"
              url = `${link}/${
                notification.toNote?.metadata?.content?.attributes?.find(
                  (attribute: any) => attribute.trait_type === "xlog_slug",
                )?.value ||
                notification.toNote?.characterId +
                  "-" +
                  notification.toNote?.noteId
              }`
              break
            case "backlinks":
              key = "backlinks" + notification.fromCharacter.handle
              character = notification.fromCharacter
              message = "follows you"
              url = link
              break
          }

          return {
            id: key,
            title: `${
              character.metadata?.content?.name
                ? character.metadata?.content?.name
                : `@${character.handle}`
            } ${message} ${
              notification.toNote?.metadata?.content?.title || ""
            }`,
            content_html: renderPageContent(
              notification.metadata?.content?.content,
            ).contentHTML,
            url: url,
            date_published: notification.createdAt,
            date_modified: notification.updatedAt,
          }
        })
        .filter((item: any) => item),
    }),
  )
  ctx.res.end()

  return {
    props: {},
  }
}

const SiteFeed: React.FC = () => null

export default SiteFeed
