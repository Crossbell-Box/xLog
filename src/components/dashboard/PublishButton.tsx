import { useEffect, useRef, useState } from "react"
import useOnClickOutside from "use-onclickoutside"

import { Button, ButtonGroup } from "../ui/Button"

export const PublishButton: React.FC<{
  save: (published: boolean) => void
  published: boolean
  isSaving: boolean
  isDisabled: boolean
}> = ({ save, published, isSaving, isDisabled }) => {
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useOnClickOutside(dropdownRef, (e) => {
    if (triggerRef.current?.contains(e.target as any)) return
    setShowDropdown(false)
  })

  useEffect(() => {
    if (isSaving) {
      setShowDropdown(false)
    }
  }, [isSaving])

  return (
    <div className="relative">
      <ButtonGroup>
        <Button
          isAutoWidth
          style={{ padding: "0 15px" }}
          onClick={() => save(true)}
          isLoading={isSaving}
          isDisabled={isDisabled}
        >
          {published ? "Update" : "Publish"}
        </Button>
        {published && (
          <Button
            isAutoWidth
            style={{ padding: "0 5px" }}
            onClick={() => {
              setShowDropdown(!showDropdown)
            }}
            ref={triggerRef}
            isDisabled={isSaving}
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24">
              <path fill="currentColor" d="m7 10l5 5l5-5z"></path>
            </svg>
          </Button>
        )}
      </ButtonGroup>
      {showDropdown && (
        <div className="absolute right-0 min-w-[200px] pt-2" ref={dropdownRef}>
          <div className="bg-white py-2 rounded-lg shadow-modal">
            {published && (
              <button
                className="flex w-full h-8 hover:bg-zinc-100 items-center px-5"
                onClick={() => save(false)}
              >
                Unpublish
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
