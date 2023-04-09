import { Menu, Popover, Transition } from "@headlessui/react"
import { Dispatch, Fragment, SetStateAction, useState } from "react"
import { useTranslation } from "react-i18next"
import { PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"

export const OptionsButton: React.FC<{
  visibility: PageVisibilityEnum | undefined
  previewPage: () => void
  renderPage: Dispatch<SetStateAction<boolean>>
  savePage: (published: boolean) => any
  propertiesWidget: React.ReactNode
  isRendering: boolean
  published: boolean
}> = ({
  visibility,
  previewPage,
  savePage,
  isRendering,
  renderPage,
  published,
  propertiesWidget,
}) => {
  const { t } = useTranslation("dashboard")

  return (
    <>
      <div
        className="bg-accent rounded-full cursor-pointer text-white w-6 h-6 flex justify-center items-center"
        onClick={() => renderPage(!isRendering)}
      >
        {isRendering ? (
          <i className="i-mingcute:eye-close-line text-xl inline-block w-6 h-6" />
        ) : (
          <i className="i-mingcute:eye2-line text-xl inline-block w-6 h-6" />
        )}
      </div>
      <Menu as="div" className="relative inline-block text-left h-6">
        {({ open, close }) => {
          return (
            <>
              <Menu.Button>
                <div className="bg-accent rounded-full cursor-pointer text-white w-6 h-6">
                  {open ? (
                    <i className="i-mingcute:up-line text-2xl inline-block w-6 h-6" />
                  ) : (
                    <i className="i-mingcute:down-line text-2xl inline-block w-6 h-6" />
                  )}
                </div>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 z-30 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-1 py-1 ">
                    <Menu.Item disabled>
                      {({ active }) => (
                        <button
                          className={`${cn(
                            `text-sm capitalize`,
                            visibility === PageVisibilityEnum.Draft
                              ? `text-zinc-300`
                              : visibility === PageVisibilityEnum.Modified
                              ? "text-orange-600"
                              : "text-green-600",
                          )} group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                        >
                          {t(visibility as string)}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="px-1 py-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-accent text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={previewPage}
                        >
                          {t("Preview")}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-accent text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={() => savePage(true)}
                        >
                          {t(published ? "Update" : "Publish")}
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active
                              ? "bg-red-600 text-white"
                              : "text-red-600 bg-white"
                          } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          onClick={() => savePage(false)}
                        >
                          {t("Delete")}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </>
          )
        }}
      </Menu>

      <Popover className="relative">
        {({ open, close }) => (
          <div className="h-6">
            <Popover.Button
              className={`
                group inline-flex items-center rounded-md  text-base font-medium   hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75`}
              // onClick={() => {
              //   setIsOpen(true)
              // }}
            >
              <div className="bg-accent rounded-full cursor-pointer text-white w-6 h-6 flex justify-center items-center">
                <i className="i-mingcute:attachment-2-line text-xl inline-block w-6 h-6" />
              </div>
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
              <Popover.Panel className="fixed bg-slate-50 h-full left-0 top-0 z-30 transform sm:px-0 lg:max-w-3xl">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 h-full">
                  {propertiesWidget}
                </div>
              </Popover.Panel>
            </Transition>
          </div>
        )}
      </Popover>
    </>
  )
}
