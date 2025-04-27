"use client"

import { useTranslations } from "next-intl"
import { forwardRef, useCallback, useMemo, useState } from "react"

import { Combobox, Transition } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { InputAdornment, TextField } from "@mui/material"

import { cn } from "~/lib/utils"

import { FieldLabel } from "./FieldLabel"

type InputProps<TMultiline extends boolean> = {
  label?: string
  addon?: string
  prefix?: string
  isBlock?: boolean
  error?: string
  help?: React.ReactNode
  multiline?: TMultiline
  options?: string[]
  renderInput?: (
    props: Omit<InputProps<false>, "renderInput">,
  ) => React.ReactElement
} & React.ComponentPropsWithRef<TMultiline extends true ? "textarea" : "input">

export type CustomInputProps = Omit<InputProps<false>, "renderInput">

export const Input = forwardRef(function Input<
  TMultiline extends boolean = false,
>(
  {
    label,
    addon,
    prefix,
    className,
    isBlock,
    error,
    help,
    multiline,
    renderInput,
    options,
    ...inputProps
  }: InputProps<TMultiline>,
  ref: TMultiline extends true
    ? React.ForwardedRef<HTMLTextAreaElement>
    : React.ForwardedRef<HTMLInputElement>,
) {
  const t = useTranslations()
  const hasAddon = !!addon
  const hasPrefix = !!prefix

  const inputComponentProps = useMemo(
    () =>
      ({
        ...inputProps,
        ref,
        className: cn(
          "input",
          hasAddon && `has-addon`,
          hasPrefix && `has-prefix`,
          isBlock && `is-block`,
          className,
        ),
      }) as any,
    [className, hasAddon, hasPrefix, inputProps, isBlock, ref],
  )

  const [selected, setSelected] = useState(inputComponentProps?.value)
  const [query, setQuery] = useState("")
  const filteredOptions = options
    ? query === ""
      ? options
      : options.filter((option) =>
          option
            .toLowerCase()
            .replace(/\s+/g, "")
            .includes(query.toLowerCase().replace(/\s+/g, "")),
        )
    : []

  const renderInputComponent = useCallback(() => {
    if (renderInput) {
      return renderInput(inputComponentProps)
    } else if (options) {
      return (
        <Combobox
          value={selected}
          onChange={(value) => {
            setSelected(value)
            inputComponentProps.onChange?.({
              target: {
                value,
              },
            })
          }}
        >
          <div className="relative">
            <TextField
              {...inputComponentProps}
              variant="outlined"
              fullWidth
              select
              onChange={(event) => {
                setQuery(event.target.value)
                inputComponentProps.onChange?.(event)
              }}
              InputProps={{
                startAdornment: prefix && (
                  <InputAdornment position="start">{prefix}</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <ChevronUpDownIcon className="size-5 text-gray-400" />
                  </InputAdornment>
                ),
              }}
            />
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery("")}
            >
              <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
                {filteredOptions.length === 0 && query !== "" ? (
                  <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                    Nothing found.
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <Combobox.Option
                      key={option}
                      className={({ active }) =>
                        `relative cursor-default select-none py-2 pl-10 pr-4 ${
                          active ? "bg-accent text-white" : "text-gray-900"
                        }`
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={`block truncate ${
                              selected ? "font-medium" : "font-normal"
                            }`}
                          >
                            {option}
                          </span>
                          {selected ? (
                            <span
                              className={`absolute inset-y-0 left-0 flex items-center pl-3 ${
                                active ? "text-white" : "text-teal-600"
                              }`}
                            >
                              <CheckIcon className="size-5" />
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
      )
    } else if (multiline) {
      return (
        <TextField
          {...inputComponentProps}
          multiline
          variant="outlined"
          rows={4}
          fullWidth
        />
      )
    } else {
      return (
        <TextField
          {...inputComponentProps}
          variant="outlined"
          fullWidth
          InputProps={{
            startAdornment: prefix && (
              <InputAdornment position="start">{prefix}</InputAdornment>
            ),
            endAdornment: addon && (
              <InputAdornment position="end">{addon}</InputAdornment>
            ),
          }}
        />
      )
    }
  }, [inputComponentProps, multiline, renderInput])

  return (
    <div>
      {label && <FieldLabel label={label} id={inputProps.id} />}
      {renderInputComponent()}
      {error && <div className="text-sm mt-1 text-red-500">{error}</div>}
      {help && !error && (
        <div className="text-xs text-gray-400 mt-1">{help}</div>
      )}
    </div>
  )
})
