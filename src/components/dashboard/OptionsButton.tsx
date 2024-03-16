import { useTranslations } from "next-intl"
import { Dispatch, Fragment, SetStateAction, useState } from "react"

import { Menu, Popover, Transition } from "@headlessui/react"

import { DeleteConfirmationModal } from "~/components/common/DeleteConfirmationModal"
import { NoteType, PageVisibilityEnum } from "~/lib/types"
import { cn } from "~/lib/utils"

export const OptionsButton = ({
  visibility,
  previewPage,
  savePage,
  deletePage,
  isRendering,
  renderPage,
  published,
  propertiesWidget,
  type,
  isModified,
  discardChanges,
}: {
  visibility: PageVisibilityEnum | undefined
  previewPage: () => void
  renderPage: Dispatch<SetStateAction<boolean>>
  savePage: () => any
  deletePage: () => any
  propertiesWidget: React.ReactNode
  isRendering: boolean
  published: boolean
  type: NoteType
  isModified: boolean
  discardChanges: () => void
}) => {
  const t = useTranslations()

  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] =
    useState<boolean>(false)

  return (
    <>
      <div
        className="bg-accent rounded-full cursor-pointer text-white size-6 flex justify-center items-center"
        onClick={() => renderPage(!isRendering)}
      >
        {isRendering ? (
          <i className="i-mingcute-eye-close-line text-xl inline-block size-5" />
        ) : (
          <i className="i-mingcute-eye-2-line text-xl inline-block size-5" />
        )}
      </div>
      <Popover className="relative">
        {({ open, close }) => (
          <div className="h-6">
            <Popover.Button
              className={`
                group inline-flex items-center rounded-md  text-base font-medium   hover:text-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75`}
              // onClick={() => {
              //   setIsOpen(true)
              // }}
            >
              <div className="bg-accent rounded-full cursor-pointer text-white size-6 flex justify-center items-center">
                <i className="i-mingcute-settings-6-line text-xl inline-block size-5" />
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
              <Popover.Panel className="fixed bg-slate-50 h-full left-0 top-0 z-30 sm:px-0 lg:max-w-3xl">
                <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 h-full">
                  {propertiesWidget}
                </div>
              </Popover.Panel>
            </Transition>
          </div>
        )}
      </Popover>
      <Menu as="div" className="relative inline-block text-left h-6">
        {({ open, close }) => {
          return (
            <>
              <Menu.Button>
                <div className="bg-accent rounded-full cursor-pointer text-white size-6 flex items-center justify-center">
                  {open ? (
                    <i className="i-mingcute-send-fill text-2xl inline-block size-5" />
                  ) : (
                    <i className="i-mingcute-send-line text-2xl inline-block size-5" />
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
                <Menu.Items className="absolute right-0 mt-2 z-30 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none">
                  <div className="p-1 ">
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
                          )} group flex w-full items-center rounded-md p-2 text-sm`}
                        >
                          {t(visibility as string)}
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                  <div className="p-1 ">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-accent text-white" : "text-gray-900"
                          } group flex w-full items-center rounded-md p-2 text-sm`}
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
                          } group flex w-full items-center rounded-md p-2 text-sm`}
                          onClick={() => savePage()}
                        >
                          {t(published ? "Update" : "Publish")}
                        </button>
                      )}
                    </Menu.Item>
                    {isModified && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? "bg-accent text-white" : "text-gray-900"
                            } group flex w-full items-center rounded-md p-2 text-sm`}
                            onClick={discardChanges}
                          >
                            {t("Discard Changes")}
                          </button>
                        )}
                      </Menu.Item>
                    )}
                    {published && (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active
                                ? "bg-red-600 text-white"
                                : "text-red-600 bg-white"
                            } group flex w-full items-center rounded-md p-2 text-sm`}
                            onClick={() => setDeleteConfirmModalOpen(true)}
                          >
                            {t("Delete")}
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </div>
                </Menu.Items>
              </Transition>
              <DeleteConfirmationModal
                open={deleteConfirmModalOpen}
                setOpen={setDeleteConfirmModalOpen}
                onConfirm={() => {
                  deletePage()
                }}
                type={type}
              />
            </>
          )
        }}
      </Menu>
    </>
  )
}
