import { Fragment } from "react"

import { Popover, Transition } from "@headlessui/react"
import { Bars3Icon } from "@heroicons/react/24/outline"

import { UniLink } from "~/components/ui/UniLink"

import { Logo } from "../common/Logo"

export const DashboardTopbar = ({
  children,
  userWidget,
  drawerWidget,
}: {
  children: (open: boolean) => React.ReactNode
  userWidget: React.ReactNode
  drawerWidget: (close: any) => React.ReactNode
}) => {
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
            <Popover.Button className="group inline-flex items-center rounded-md text-base font-medium hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75">
              <Bars3Icon className="size-6" />
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
              <Popover.Panel className="fixed bg-slate-50 h-full left-0 top-0 z-20 w-sidebar sm:px-0 lg:max-w-3xl">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 h-full">
                  {drawerWidget(close)}
                </div>
              </Popover.Panel>
            </Transition>
          </div>
        )}
      </Popover>

      <UniLink
        href="/"
        className="mb-2 px-5 pt-3 pb-2 text-2xl font-extrabold flex items-center"
      >
        <div className="inline-block size-9 mr-3">
          <Logo type="lottie" width={36} height={36} autoplay={false} />
        </div>
        xLog
      </UniLink>
      <div className="flex-1"></div>
      {userWidget}
    </div>
  )
}
