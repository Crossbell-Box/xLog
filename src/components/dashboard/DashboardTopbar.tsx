import { useState, useEffect, useMemo, Fragment } from "react"
import { setStorage, getStorage } from "~/lib/storage"

import { Bars3Icon, ChevronDownIcon } from "@heroicons/react/24/outline"
import { Logo } from "../common/Logo"
import { Popover, Transition } from "@headlessui/react"

export const DashboardTopbar: React.FC<{
  children: (open: boolean) => React.ReactNode
  userWidget: React.ReactNode
  drawerWidget: (close: any) => React.ReactNode
}> = ({ children, userWidget, drawerWidget }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="w-full top-0 h-16 bg-slate-50 z-20 transition-all flex flex-row fixed px-5 md:px-10 items-center">
      <Popover className="relative">
        {({ open, close }) => (
          <div className="h-6">
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0"
              enterTo="opacity-10"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-10"
              leaveTo="opacity-0"
            >
              <Popover.Overlay className="fixed inset-0 bg-black opacity-10" />
            </Transition>
            <Popover.Button
              className={`
                group inline-flex items-center rounded-md  text-base font-medium   hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              onClick={() => {
                setIsOpen(true)
              }}
            >
              <Bars3Icon className="h-6 w-6" />
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 transform -translate-x-full"
              enterTo="opacity-100 transform translate-x-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 transform translate-x-0"
              leaveTo="opacity-0 transform -translate-x-full"
            >
              <Popover.Panel className="fixed bg-slate-50 h-full left-0 top-0 z-20 w-sidebar transform sm:px-0 lg:max-w-3xl">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 h-full">
                  {drawerWidget(close)}
                </div>
              </Popover.Panel>
            </Transition>
          </div>
        )}
      </Popover>

      <div className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center">
        <div className="inline-block w-9 h-9 mr-3">
          <Logo type="lottie" width={36} height={36} autoplay={false} />
        </div>
        xLog
      </div>
      <div className="flex-1"></div>
      {userWidget}
      <div className="w-[1px] bg-border absolute top-0 right-0 bottom-0"></div>
    </div>
  )
}
