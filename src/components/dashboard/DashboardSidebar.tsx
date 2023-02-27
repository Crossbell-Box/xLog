import { ChevronRightIcon, ChevronLeftIcon } from "@heroicons/react/20/solid"
import { useState, useEffect, useMemo } from "react"
import { setStorage, getStorage } from "~/lib/storage"

export const DashboardSidebar: React.FC<{
  children: (isOpen: boolean) => React.ReactNode
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const storage = getStorage("sidebar")
    if (storage) {
      setIsOpen(storage.isOpen)
    }
  }, [])

  useEffect(() => {
    setStorage("sidebar", {
      isOpen,
    })
  }, [isOpen])

  return (
    <div
      className={`${
        isOpen ? `w-sidebar` : "w-20"
      } relative bg-slate-50 z-10 h-full transition-all`}
    >
      {children(isOpen)}
      <div className="w-[1px] bg-border absolute top-0 right-0 bottom-0"></div>
      <div
        className="absolute top-5 -right-3 bg-accent rounded-full cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronLeftIcon className="w-6 h-6 text-white" />
        ) : (
          <ChevronRightIcon className="w-6 h-6 text-white" />
        )}
      </div>
    </div>
  )
}
