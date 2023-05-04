import { Fragment, useCallback, useState } from "react"

import { Combobox, Transition } from "@headlessui/react"
import {
  CheckIcon,
  ChevronUpDownIcon,
  XMarkIcon,
} from "@heroicons/react/20/solid"

interface Props {
  userTags: string[]
}

export function TagInput({ className, userTags }: Props) {
  const [selected, setSelected] = useState("")
  const [query, setQuery] = useState("")

  const [tags, setTags] = useState<string[]>([])

  const onComboboxChange = useCallback((value: string) => {
    setTags((tags) => tags.concat([value]))
  }, [])

  const onDel = useCallback((value: string) => {
    setTags((tags) => tags.filter((tag) => tag !== value))
  }, [])

  const filteredTags =
    query === ""
      ? tags
      : tags.filter((tag) =>
          tag
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        )

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <div
            className="text-xs flex items-center font-bold leading-sm px-1 py-1 rounded-md"
            style={{
              background: "var(--theme-color)",
              color: "rgba(var(--tw-colors-i-white), var(--tw-text-opacity))",
            }}
            key={tag}
          >
            <span>{tag}</span>
            <XMarkIcon className="h-5 w-5" onClick={() => onDel(tag)} />
          </div>
        ))}
      </div>
      <Combobox value={selected} onChange={onChange}>
        <div className="relative mt-1">
          <div className="relative flex w-full cursor-default overflow-hidden rounded-lg bg-white text-left shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm">
            <Combobox.Input
              onChange={(event) => setQuery(event.target.value)}
              className={className}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={() => setQuery("")}
          >
            <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {filteredTags.length === 0 && query !== "" ? (
                <Combobox.Option value={{ id: null, name: query }}>
                  Create {query}
                </Combobox.Option>
              ) : (
                filteredTags.map((tag) => (
                  <Combobox.Option
                    key={tag}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${
                        active ? "bg-yellow-700 text-white" : "text-gray-900"
                      }`
                    }
                    value={tag}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={`block truncate ${
                            selected ? "font-medium" : "font-normal"
                          }`}
                        >
                          {tag}
                        </span>
                        {selected ? (
                          <span
                            className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                              active ? "text-white" : "text-teal-600"
                            }`}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Combobox.Option>
                ))
              )}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
