import { useTranslations } from "next-intl"

import { Button } from "../ui/Button"
import { Modal } from "../ui/Modal"

export const DeleteConfirmationModal = ({
  open,
  setOpen,
  onConfirm,
  type,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  onConfirm: () => void
  type?: string
}) => {
  const t = useTranslations()

  return (
    <Modal open={open} setOpen={setOpen}>
      <div className="px-5 py-4 space-y-4">
        <p>{t("delete_confirmation", { context: t(type) })}</p>
        <div className="flex justify-end space-x-2">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            <span className="truncate">{t("Cancel")}</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setOpen(false)
              onConfirm()
            }}
          >
            <span className="truncate">{t("Confirm")}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
