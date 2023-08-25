import { useState } from "react"

import { Button } from "~/components/ui/Button"
import { Values, useEditorState } from "~/hooks/useEditorState"
import { useTranslation } from "~/lib/i18n/client"

export default function EditorAutofill({
  updateValue,
}: {
  updateValue: (val: Partial<Values>) => void
}) {
  const { t } = useTranslation("dashboard")
  const externalUrl = useEditorState((state) => state.externalUrl)

  const [filling, setFilling] = useState(false)
  const autofill = async () => {
    setFilling(true)
    const result = await (
      await fetch(`/api/open-graph?url=${externalUrl}`)
    ).json()
    const time =
      result?.articlePublishedTime || result?.publishedTime || result?.ogDate

    updateValue({
      cover: result?.ogImage?.[0]
        ? {
            address: result?.ogImage?.[0]?.url,
            mime_type: result?.ogImage?.[0]?.type,
          }
        : undefined,
      title: result?.ogTitle,
      excerpt: result?.ogDescription,
      publishedAt: time ? new Date(time).toISOString() : undefined,
    })
    setFilling(false)
  }

  return (
    <Button onClick={autofill} isLoading={filling}>
      {t("Autofill")}
    </Button>
  )
}
