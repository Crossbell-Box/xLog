"use client"

import { useEffect, useState } from "react"

import { UniLink } from "~/components/ui/UniLink"
import { useUserRole } from "~/hooks/useUserRole"
import { SITE_URL } from "~/lib/env"
import { useTranslation } from "~/lib/i18n/client"

export const EditButton = ({
  handle,
  noteId,
  isPost,
}: {
  handle?: string
  noteId?: number
  isPost?: boolean
}) => {
  const { t } = useTranslation("common")
  const [showEdit, setShowEdit] = useState(false)
  const userRole = useUserRole(handle)
  useEffect(() => {
    if (userRole.isSuccess && userRole.data) {
      setShowEdit(true)
    }
  }, [userRole.isSuccess, userRole.data])

  return (
    <>
      {showEdit && (
        <UniLink
          className="xlog-post-editor inline-flex items-center"
          href={`${SITE_URL}/dashboard/${handle}/editor?id=${noteId}&type=${
            isPost ? "post" : "page"
          }`}
        >
          <i className="icon-[mingcute--edit-line] mx-1" /> {t("Edit")}
        </UniLink>
      )}
    </>
  )
}
