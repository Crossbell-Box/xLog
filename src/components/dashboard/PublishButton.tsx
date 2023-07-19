import { useEffect, useRef, useState } from "react"
import useOnClickOutside from "use-onclickoutside"

import { useTranslation } from "~/lib/i18n/client"

import { Button, ButtonGroup } from "../ui/Button"
import { DeleteConfirmationModal } from "./DeleteConfirmationModal"

export const PublishButton = ({
  savePage,
  deletePage,
  discardChanges,
  published,
  isSaving,
  isDisabled,
  isModified,
  twitterShareUrl,
  isPost,
}: {
  savePage: () => void
  deletePage: () => void
  published: boolean
  isSaving: boolean
  isDisabled: boolean
  twitterShareUrl?: string
  isPost: boolean
  isModified: boolean
  discardChanges: () => void
}) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const { t } = useTranslation("dashboard")

  useOnClickOutside(dropdownRef, (e) => {
    if (triggerRef.current?.contains(e.target as any)) return
    setShowDropdown(false)
  })

  useEffect(() => {
    if (isSaving) {
      setShowDropdown(false)
    }
  }, [isSaving])

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
          <Button
            isAutoWidth
            style={{ padding: "0 8px" }}
            onClick={() => {
              setShowDropdown(!showDropdown)
            }}
            ref={triggerRef}
            isDisabled={isSaving}
          >
            <i className="icon-[mingcute--down-line]" />
          </Button>
        )}
      </ButtonGroup>
      {showDropdown && (
        <div
          className="absolute right-0 min-w-[200px] pt-2 z-10"
          ref={dropdownRef}
        >
          <div className="bg-white py-2 rounded-lg shadow-modal">
            {published && (
              <div>
                <button
                  className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                  onClick={() => window.open(twitterShareUrl)}
                >
                  <i className="icon-[mingcute--twitter-line] mr-1"></i>
                  {t("Share to Twitter")}
                </button>
                {isModified && (
                  <button
                    className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                    onClick={discardChanges}
                  >
                    <i className="icon-[mingcute--delete-back-line] mr-1"></i>
                    {t("Discard Changes")}
                  </button>
                )}
                <button
                  className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                  onClick={() => setDeleteConfirmModalOpen(true)}
                >
                  <i className="icon-[mingcute--delete-2-line] mr-1"></i>
                  {t("Delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      <DeleteConfirmationModal
        open={deleteConfirmModalOpen}
        setOpen={setDeleteConfirmModalOpen}
        onConfirm={() => {
          deletePage()
        }}
        isPost={isPost}
      />
    </div>
  )
}
