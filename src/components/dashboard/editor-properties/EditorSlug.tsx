import { useTranslations } from "next-intl"
import { ChangeEvent } from "react"

import { Input } from "~/components/ui/Input"
import { UniLink } from "~/components/ui/UniLink"
import { useEditorState } from "~/hooks/useEditorState"
import { EditorValues } from "~/lib/types"

export default function EditorSlug({
  updateValue,
  defaultValue,
  type,
  siteLink,
}: {
  updateValue: (val: EditorValues) => void
  defaultValue?: string
  type: string
  siteLink?: string
}) {
  const t = useTranslations()
  const value = useEditorState((state) => state.slug)

  return (
    <div>
      <Input
        name="slug"
        value={value}
        placeholder={defaultValue}
        label={t("Slug") || ""}
        id="slug"
        isBlock
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          updateValue({
            slug: e.target.value,
          })
        }
        help={
          <>
            {(value || defaultValue) && (
              <>
                {t(`This ${type} will be accessible at`)}{" "}
                <UniLink
                  href={`${siteLink}/${encodeURIComponent(
                    value || defaultValue || "",
                  )}`}
                  className="hover:underline"
                >
                  {siteLink}/{encodeURIComponent(value || defaultValue || "")}
                </UniLink>
              </>
            )}
          </>
        }
      />
    </div>
  )
}
