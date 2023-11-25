import { useTranslations } from "next-intl"

import { Button } from "~/components/ui/Button"
import { ModalContentProps } from "~/components/ui/ModalStack"
import { UniLink } from "~/components/ui/UniLink"

export default function PublishedModal({
  dismiss,
  postUrl,
  transactionUrl,
  twitterShareUrl,
}: ModalContentProps<{
  postUrl?: string
  transactionUrl: string
  twitterShareUrl?: string
}>) {
  const t = useTranslations()

  return (
    <>
      <div className="p-5">
        {t(
          "Your publication has been securely stored on the blockchain Now you may want to",
        )}
        <ul className="list-disc pl-5 mt-2 space-y-1">
          {postUrl && (
            <li>
              <UniLink className="text-accent" href={postUrl}>
                {t("View the post")}
              </UniLink>
            </li>
          )}
          <li>
            <UniLink className="text-accent" href={transactionUrl}>
              {t("View the transaction")}
            </UniLink>
          </li>
          {twitterShareUrl && (
            <li>
              <UniLink className="text-accent" href={twitterShareUrl}>
                {t("Share to Twitter")}
              </UniLink>
            </li>
          )}
        </ul>
      </div>
      <div className="h-16 border-t flex items-center px-5">
        <Button isBlock onClick={() => dismiss()}>
          {t("Got it, thanks!")}
        </Button>
      </div>
    </>
  )
}
