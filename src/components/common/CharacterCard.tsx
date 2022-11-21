import { useEffect, useState } from "react"
import {
  offset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useHover,
  useFocus,
  useRole,
  useDismiss,
} from "@floating-ui/react-dom-interactions"
import { Avatar } from "~/components/ui/Avatar"
import dayjs, { formatToISO } from "~/lib/date"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import * as siteModel from "~/models/site.model"
import type { Profile } from "~/lib/types"

export const CharacterCard: React.FC<{
  siteId?: string
  children: JSX.Element
}> = ({ siteId, children }) => {
  const [open, setOpen] = useState(false)

  const { x, y, reference, floating, strategy, context } = useFloating({
    placement: "bottom-start",
    open,
    onOpenChange: setOpen,
    middleware: [offset(5), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useHover(context, { delay: { close: 200, open: 200 } }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const [buttonLoading, setButtonLoading] = useState(false)
  const [firstOpen, setFirstOpen] = useState("")
  const [site, setSite] = useState<Profile>()

  useEffect(() => {
    if (open && siteId && (firstOpen !== siteId || !site)) {
      setFirstOpen(siteId)
      siteModel.getSite(siteId).then((site) => setSite(site))
    }
  }, [open, firstOpen, siteId, site])

  return (
    <span {...getReferenceProps({ ref: reference, ...children.props })}>
      {children}
      {(open || buttonLoading) && (
        <span
          {...getFloatingProps({
            ref: floating,
            className:
              "border-gray-100 rounded-lg p-4 bg-white z-10 space-y-2 text-sm w-80 shadow-xl block",
            style: {
              position: strategy,
              top: y ?? "",
              left: x ?? "",
            },
          })}
        >
          {site ? (
            <>
              <span className="flex items-center justify-between">
                <Avatar
                  images={site?.avatars || []}
                  name={site?.name}
                  size={45}
                />
                <FollowingButton
                  siteId={siteId}
                  size="sm"
                  loadingStatusChange={(status) => setButtonLoading(status)}
                />
              </span>
              <span className="block">
                <span className="font-bold text-base">{site?.name}</span>
                <span className="ml-1 text-gray-600">@{siteId}</span>
              </span>
              {site?.description && (
                <span
                  className="block text-gray-600"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></span>
              )}
              <span className="block">
                <FollowingCount siteId={siteId} disableList={true} />
              </span>
              <span className="block text-gray-500">
                Joined{" "}
                <time dateTime={formatToISO(site?.date_created)}>
                  {dayjs
                    .duration(
                      dayjs(site?.date_created).diff(dayjs(), "minute"),
                      "minute",
                    )
                    .humanize()}{" "}
                  ago
                </time>
              </span>
            </>
          ) : (
            "Loading..."
          )}
        </span>
      )}
    </span>
  )
}
