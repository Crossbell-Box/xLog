import { useState } from "react"
import { toast } from "react-hot-toast"
import { shallow } from "zustand/shallow"

import { ChevronDown, X } from "@mui/icons-material" // Import Material UI icons
import { Autocomplete, Chip, TextField } from "@mui/material" // Import Material UI components

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
          <Chip
            key={tag}
            label={tag}
            onDelete={() => onDel(tag)}
            color="primary"
            deleteIcon={<X />}
            className="mr-2 mb-2"
          />
        ))}
      </div>

      <Autocomplete
        freeSolo
        disableClearable
        value={query}
        onInputChange={(_, value) => setQuery(value)}
        onChange={(_, value) => onComboboxChange(value)}
        options={filteredTags}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Add Tags"
            variant="outlined"
            fullWidth
            {...restProps}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} className="cursor-pointer">
            <span className={cn("block truncate")}>{option}</span>
          </li>
        )}
        popupIcon={<ChevronDown />}
      />
    </div>
  )
}
