import { forwardRef, useCallback, useMemo } from "react"
import type { ReactElement } from "react"

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
  renderInput?: (props: Omit<InputProps<false>, "renderInput">) => ReactElement
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
    ...inputProps
  }: InputProps<TMultiline>,
  ref: TMultiline extends true
    ? React.ForwardedRef<HTMLTextAreaElement>
    : React.ForwardedRef<HTMLInputElement>,
) {
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
      } as any),
    [className, hasAddon, hasPrefix, inputProps, isBlock, ref],
  )

  const renderInputComponent = useCallback(() => {
    if (renderInput) {
      return renderInput(inputComponentProps)
    } else if (multiline) {
      return <textarea {...inputComponentProps} />
    } else {
      return <input {...inputComponentProps} />
    }
  }, [inputComponentProps, multiline, renderInput])

  return (
    <div>
      {label && <FieldLabel label={label} id={inputProps.id} />}
      <div className="flex items-center">
        {prefix && (
          <span className="flex items-center px-3 text-gray-600 bg-gray-50 h-10 border border-r-0 rounded-l-lg relative -z-10">
            {prefix}
          </span>
        )}
        {renderInputComponent()}
        {addon && (
          <span className="flex items-center px-3 text-gray-600 bg-gray-50 h-10 border border-l-0 rounded-r-lg relative -z-10">
            {addon}
          </span>
        )}
      </div>
      {error && <div className="text-sm mt-1 text-red-500">{error}</div>}
      {help && !error && (
        <div className="text-xs text-gray-400 mt-1">{help}</div>
      )}
    </div>
  )
}) as <TMultiline extends boolean = false>(
  props: InputProps<TMultiline>,
) => JSX.Element
