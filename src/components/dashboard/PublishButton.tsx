import { useTranslations } from "next-intl"
import { useState } from "react"

import { Placement } from "@floating-ui/react"

import { Menu } from "~/components//ui/Menu"
import { DeleteConfirmationModal } from "~/components/common/DeleteConfirmationModal"
import { NoteType } from "~/lib/types"

import { Button, ButtonGroup } from "../ui/Button"

export const PublishButton = ({
  savePage,
  deletePage,
  discardChanges,
  published,
  isSaving,
  isDisabled,
  isModified,
  twitterShareUrl,
  type,
  placement = "bottom-end",
}: {
  savePage: () => void
  deletePage: () => void
  published: boolean
  isSaving: boolean
  isDisabled: boolean
  twitterShareUrl?: string
  type: NoteType
  isModified: boolean
  discardChanges: () => void
  placement?: Placement
}) => {
  const t = useTranslations()

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] =
    useState<boolean>(false)

  return (
    <div className="relative">
      <ButtonGroup>
        <Button
          isAutoWidth
          style={{ padding: "0 15px" }}
          onClick={() => savePage()}
          isLoading={isSaving}
          isDisabled={isDisabled}
        >
          {t(published ? "Update" : "Publish")}
        </Button>
        {published && (
          <Menu
            placement={placement}
            target={
              <Button
                isAutoWidth
                style={{ padding: "0 8px" }}
                isDisabled={isSaving}
                className="!rounded-r-full"
              >
                <i className="i-mingcute-down-line" />
              </Button>
            }
            dropdown={
              <div>
                <button
                  className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                  onClick={() => window.open(twitterShareUrl)}
                >
                  <i className="i-mingcute-twitter-line mr-1"></i>
                  {t("Share to Twitter")}
                </button>
                {isModified && (
                  <button
                    className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                    onClick={discardChanges}
                  >
                    <i className="i-mingcute-delete-back-line mr-1"></i>
                    {t("Discard Changes")}
                  </button>
                )}
                <button
                  className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                  onClick={() => setDeleteConfirmModalOpen(true)}
                >
                  <i className="i-mingcute-delete-2-line mr-1"></i>
                  {t("Delete")}
                </button>
              </div>
            }
          />
        )}
      </ButtonGroup>
      <DeleteConfirmationModal
        open={deleteConfirmModalOpen}
        setOpen={setDeleteConfirmModalOpen}
        onConfirm={() => {
          deletePage()
        }}
        type={type}
      />
    </div>
  )
}
