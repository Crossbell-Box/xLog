"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { UniLink } from "~/components/ui/UniLink"
import { useUserRole } from "~/hooks/useUserRole"
import { SITE_URL } from "~/lib/env"
import { NoteType } from "~/lib/types"

export const EditButton = ({
  handle,
  noteId,
  type,
}: {
  handle?: string
  noteId?: number
  type?: NoteType
}) => {
  const t = useTranslations()
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
          href={`${SITE_URL}/dashboard/${handle}/editor?id=${noteId}&type=${type}`}
        >
          <i className="i-mingcute-edit-line mx-1" /> {t("Edit")}
        </UniLink>
      )}
    </>
  )
}
