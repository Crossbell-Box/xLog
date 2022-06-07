import clsx from "clsx"
import { forwardRef } from "react"
import { FieldLabel } from "./FieldLabel"

type InputProps<TMultiline extends boolean> = {
  label?: string
  addon?: string
  isBlock?: boolean
  error?: string
  help?: React.ReactNode
  multiline?: TMultiline
} & React.ComponentPropsWithRef<TMultiline extends true ? "textarea" : "input">

export const Input = forwardRef(function Input<
  TMutliline extends boolean = false,
>(
  {
    label,
    addon,
    className,
    isBlock,
    error,
    help,
    multiline,
    ...inputProps
  }: InputProps<TMutliline>,
  ref: TMutliline extends true
    ? React.ForwardedRef<HTMLTextAreaElement>
    : React.ForwardedRef<HTMLInputElement>,
) {
  const hasAddon = !!addon
  const Component = (multiline ? "textarea" : "input") as any

  return (
    <div>
      {label && <FieldLabel label={label} id={inputProps.id} />}
      <div className="flex items-center">
        <Component
          {...inputProps}
          ref={ref as any}
          className={clsx(
            "input",
            hasAddon && `has-addon`,
            isBlock && `is-block`,
            className,
          )}
        />
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
