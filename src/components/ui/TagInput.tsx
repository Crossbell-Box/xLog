import { Fragment, useState } from "react"
import { toast } from "react-hot-toast"
import { shallow } from "zustand/shallow"

import { Combobox, Transition } from "@headlessui/react"
import { ChevronUpDownIcon, XMarkIcon } from "@heroicons/react/20/solid"

import { useEditorState } from "~/hooks/useEditorState"
import { cn } from "~/lib/utils"

import { CustomInputProps } from "./Input"

type Props = CustomInputProps & {
  userTags: string[]
  onTagChange: (tags: string) => void
}

export function TagInput({
  userTags = [],
  value,
  onTagChange,
  ...restProps
}: Props) {
  const [query, setQuery] = useState("")

  const { editorTags = [], setValues } = useEditorState(
    (state) => ({
      editorTags: state.tags === "" ? [] : state.tags?.split(","),
      setValues: state.setValues,
    }),
    shallow,
  )

  const onChange = (type: "add" | "delete", value: string) => {
    let tags = ""
    if (type === "add") {
      if (editorTags.includes(value)) {
        toast.error("Duplicate tag")
        return
      }
      tags = [...editorTags, value].join(",")
    } else {
      tags = editorTags.filter((tag) => tag !== value).join(",")
    }

    setValues({ tags })
    onTagChange(tags)
  }

  const onComboboxChange = (value: string) => {
    onChange("add", value)
  }

  const onDel = (value: string) => {
    onChange("delete", value)
  }

  const filteredTags =
    query === ""
      ? userTags
      : Array.from(new Set([query, ...userTags])).filter((tag) =>
          (tag ?? "")
            .toString()
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        )

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-2">
        {editorTags.map((tag) => (
          <div
            className="text-xs flex items-center font-semibold p-1 rounded-md bg-accent text-white"
            key={tag}
          >
            <span>{tag}</span>
            <XMarkIcon className="size-5" onClick={() => onDel(tag)} />
          </div>
        ))}
      </div>
      <Combobox onChange={onComboboxChange}>
        <div className="relative mt-1">
          <div className="relative flex w-full cursor-default overflow-hidden rounded-lg bg-white text-left sm:text-sm">
            <Combobox.Input
              {...restProps}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="size-5 text-black"
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
            <Combobox.Options className="absolute max-h-60 w-full overflow-auto rounded-md bg-white p-1 text-base shadow-lg ring-1 ring-black/5 sm:text-sm">
              {filteredTags.map((tag) => (
                <Combobox.Option
                  key={tag}
                  className={({ active }) =>
                    cn(
                      "relative cursor-default select-none py-2 px-4",
                      active ? "bg-accent text-white" : "text-black",
                    )
                  }
                  value={tag}
                >
                  <span className={cn("block truncate font-normal")}>
                    {tag}
                  </span>
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Transition>
        </div>
      </Combobox>
    </div>
  )
}
