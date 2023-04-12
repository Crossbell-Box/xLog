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
      } transition-[width] relative flex-shrink-0`}
    >
      <div
        className={`${
          isOpen ? `w-sidebar` : "w-20"
        } transition-[width] fixed bg-slate-50 z-10 h-full flex flex-col`}
      >
        {children(isOpen)}
        <div className="w-[1px] bg-border absolute top-0 right-0 bottom-0"></div>
        <div
          className="absolute top-5 -right-3 bg-accent rounded-full cursor-pointer text-white w-6 h-6"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <i className="i-mingcute:left-line text-2xl inline-block w-6 h-6" />
          ) : (
            <i className="i-mingcute:right-line text-2xl inline-block w-6 h-6" />
          )}
        </div>
      </div>
    </div>
  )
}
