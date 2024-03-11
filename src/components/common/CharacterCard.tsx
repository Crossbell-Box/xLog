import { useTranslations } from "next-intl"

import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import { Titles } from "~/components/common/Titles"
import { Avatar } from "~/components/ui/Avatar"
import { Skeleton } from "~/components/ui/Skeleton"
import { useDate } from "~/hooks/useDate"
import { getSiteLink } from "~/lib/helpers"
import { cn } from "~/lib/utils"
import { useGetCharacterCard } from "~/queries/site"

export const CharacterCard = ({
  siteId,
  address,
  open,
  setButtonLoading,
  hideFollowButton,
  simple,
  style,
}: {
  siteId?: string
  address?: string
  open?: boolean
  setButtonLoading?: (loading: boolean) => void
  hideFollowButton?: boolean
  simple?: boolean
  style?: "flat" | "normal"
}) => {
  const date = useDate()
  const t = useTranslations()

  const { data: site } = useGetCharacterCard({
    siteId,
    address,
    enabled: open || false,
  })

  return (
    <span
      className={cn(
        "border-border border rounded-lg text-sm block cursor-default",
        style === "flat" ? "" : "p-4 bg-white shadow-xl",
        simple ? "space-y-1" : "space-y-2",
      )}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
    >
      {site ? (
        <>
          <span className="flex items-center justify-between">
            <Avatar
              cid={site?.characterId}
              images={site?.metadata?.content?.avatars || []}
              name={site?.metadata?.content?.name}
              size={45}
            />
            {!hideFollowButton && (
              <FollowingButton
                site={site}
                size="sm"
                loadingStatusChange={(status) => setButtonLoading?.(status)}
              />
            )}
          </span>
          <span className="flex items-center space-x-1">
            <span
              className="font-bold text-base text-zinc-800 cursor-pointer hover:underline"
              onClick={(e) => {
                e.preventDefault()
                window.open(
                  `${getSiteLink({
                    subdomain: siteId || "",
                  })}`,
                )
              }}
            >
              {site?.metadata?.content?.name}
            </span>
            <Titles characterId={+(site?.characterId || "")} />
            <span className="text-gray-600">@{site?.handle}</span>
          </span>
          {site?.metadata?.content?.bio && (
            <span className="text-gray-600 line-clamp-4">
              {site?.metadata?.content?.bio}
            </span>
          )}
          {!simple && (
            <span className="block">
              <FollowingCount
                characterId={site.characterId}
                disableList={true}
              />
            </span>
          )}
          {!simple && site?.createdAt && (
            <span className="block text-gray-500">
              <time dateTime={date.formatToISO(site.createdAt)}>
                {t("joined ago", {
                  time: date.dayjs
                    .duration(
                      date.dayjs(site.createdAt).diff(date.dayjs(), "minute"),
                      "minute",
                    )
                    .humanize(),
                })}
              </time>
            </span>
          )}
        </>
      ) : (
        <Skeleton.Container className={cn(simple ? "space-y-1" : "space-y-2")}>
          <div className="flex justify-between items-center">
            <Skeleton.Circle size={40} />
            <Skeleton.Rectangle className="h-7 w-24" />
          </div>
          <Skeleton.Rectangle className="w-2/3" />
          <Skeleton.Rectangle className="my-4 w-full h-16" />
          <Skeleton.Rectangle className="w-1/2" />
        </Skeleton.Container>
      )}
    </span>
  )
}
