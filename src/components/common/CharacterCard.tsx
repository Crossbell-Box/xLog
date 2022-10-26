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
import dayjs from "dayjs"
import duration from "dayjs/plugin/duration"
import relativeTime from "dayjs/plugin/relativeTime"
import { FollowingButton } from "~/components/common/FollowingButton"
import { FollowingCount } from "~/components/common/FollowingCount"
import * as siteModel from "~/models/site.model"
import type { Profile } from "~/lib/types"

dayjs.extend(duration)
dayjs.extend(relativeTime)

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
    useHover(context, { delay: { close: 100 } }),
    useFocus(context),
    useRole(context, { role: "tooltip" }),
    useDismiss(context),
  ])

  const [buttonLoading, setButtonLoading] = useState(false)
  const [firstOpen, setFirstOpen] = useState(false)
  const [site, setSite] = useState<Profile>()

  useEffect(() => {
    if (!firstOpen && open && siteId && !site) {
      setFirstOpen(true)
      siteModel.getSite(siteId).then((site) => setSite(site))
    }
  }, [open, firstOpen, siteId, site])

  return (
    <div {...getReferenceProps({ ref: reference, ...children.props })}>
      {children}
      {(open || buttonLoading) && (
        <div
          {...getFloatingProps({
            ref: floating,
            className:
              "border-gray-100 rounded-lg p-4 bg-white z-10 space-y-2 text-sm w-80 shadow-xl",
            style: {
              position: strategy,
              top: y ?? "",
              left: x ?? "",
            },
          })}
        >
          {site ? (
            <>
              <div className="flex items-center justify-between">
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
              </div>
              <div>
                <span className="font-bold text-base">{site?.name}</span>
                <span className="ml-1 text-gray-600">@{siteId}</span>
              </div>
              {site?.description && (
                <div
                  className="text-gray-600"
                  dangerouslySetInnerHTML={{ __html: site?.description || "" }}
                ></div>
              )}
              <div>
                <FollowingCount siteId={siteId} disableList={true} />
              </div>
              <div className="text-gray-500">
                Joined{" "}
                {dayjs
                  .duration(
                    dayjs(site?.date_created).diff(dayjs(), "minute"),
                    "minute",
                  )
                  .humanize()}{" "}
                ago
              </div>
            </>
          ) : (
            "Loading..."
          )}
        </div>
      )}
    </div>
  )
}
