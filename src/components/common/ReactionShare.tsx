import { useTranslations } from "next-intl"
import dynamic from "next/dynamic"
import { FC } from "react"
import { toast } from "react-hot-toast"

import { useIsClient } from "~/hooks/useClient"
import { cn } from "~/lib/utils"

import { Button } from "../ui/Button"
import { useModalStack } from "../ui/ModalStack"
import { Tooltip } from "../ui/Tooltip"

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((module) => module.QRCodeSVG),
  { ssr: false },
)

interface ShareData {
  url: string
  title: string
  text: string
}

const shareList = [
  {
    name: "X",
    icon: <img width={16} height={16} src="https://icons.ly/x" alt="x" />,
    onClick: (data: ShareData) => {
      window.open(
        `https://x.com/intent/tweet?url=${
          data.url
        }&text=${encodeURIComponent(data.text)}&via=_xLog`,
      )
    },
  },
  {
    name: "Telegram",
    icon: (
      <img
        width={16}
        height={16}
        src="https://icons.ly/telegram"
        alt="telegram"
      />
    ),
    onClick: (data: ShareData) => {
      window.open(
        `https://telegram.me/share/url?url=${data.url}&text=${data.text}`,
      )
    },
  },

  {
    name: "Copy",
    icon: <i className="i-mingcute-copy-fill" />,
    onClick: (data: ShareData) => {
      navigator.clipboard.writeText(data.url)
      toast.success("Copied to clipboard", {
        position: "bottom-right",
      })
    },
  },
]

export const ReactionShare: FC<{
  noteId?: number
  vertical?: boolean
  size?: "sm" | "base"
}> = ({ vertical, size }) => {
  const t = useTranslations()

  const isClient = useIsClient()

  const presentModal = usePresentShareModal()

  if (!isClient) return null

  // TODO: get from Note

  const handleShare = () => {
    const title = document.title
    const url = location.href
    const text = t("Share Message", { title })
    presentModal({
      url,
      title,
      text,
    })
  }

  return (
    <>
      <div className={cn("xlog-reactions-share flex items-center sm:mb-0")}>
        <Button
          variant="share"
          variantColor={vertical ? "light" : undefined}
          className={cn(
            "flex items-center",
            vertical ? "!h-auto flex-col" : "mr-2",
          )}
          isAutoWidth={true}
          onClick={handleShare}
        >
          {(() => {
            const inner = (
              <i
                className={cn(
                  "i-mingcute-share-forward-fill",
                  size === "sm"
                    ? "text-base"
                    : vertical
                      ? "text-[33px]"
                      : "text-[38px]",
                  !vertical && "mr-1",
                )}
              ></i>
            )
            return size !== "sm" ? (
              <Tooltip
                label={t("Share")}
                placement={vertical ? "right" : "top"}
              >
                {inner}
              </Tooltip>
            ) : (
              inner
            )
          })()}
        </Button>
      </div>
    </>
  )
}

const usePresentShareModal = () => {
  const { present } = useModalStack()
  const t = useTranslations()
  return (props: ShareModalProps) => {
    present({
      title: t("Share Modal") || "",
      content: () => <ShareModal {...props} />,
    })
  }
}
interface ShareModalProps {
  url: string
  title: string
  text: string
}
const ShareModal: FC<ShareModalProps> = ({ url, text, title }) => {
  return (
    <div className="relative grid grid-cols-[200px_auto] gap-5 px-5 py-6">
      <div className="qrcode inline-block min-h-[200px]">
        <QRCodeSVG
          value={url}
          className="aspect-square w-[200px]"
          height={200}
          width={200}
        />
      </div>
      <div className="share-options flex flex-col gap-2">
        <ul className="w-[200px] flex-col gap-2 [&>li]:flex [&>li]:items-center [&>li]:space-x-2">
          {shareList.map(({ name, icon, onClick }) => (
            <li
              key={name}
              className="flex cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-lg transition-colors hover:bg-gray-100 [&_img]:size-4"
              aria-label={`Share to ${name}`}
              role="button"
              onClick={() => onClick({ url, text, title })}
            >
              {icon}
              <span>{name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
