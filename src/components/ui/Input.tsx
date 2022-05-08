import clsx from "clsx"
import { DetailedHTMLProps, InputHTMLAttributes } from "react"

export const Input: React.FC<
  DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label?: string
    addon?: string
    isBlock?: boolean
    error?: string
  }
> = ({ label, addon, className, isBlock, error, ...inputProps }) => {
  const hasAddon = !!addon
  return (
    <div>
      {label && (
        <label className="label" htmlFor={inputProps.id}>
          {label}
        </label>
      )}
      <div className="flex items-center">
        <input
          {...inputProps}
          className={clsx(
            "input",
            hasAddon && `has-addon`,
            isBlock && `is-block`,
            className
          )}
        />
        {addon && (
          <span className="flex items-center px-3 text-gray-600 bg-gray-50 h-10 border border-l-0 rounded-r-lg relative -z-10">
            {addon}
          </span>
        )}
      </div>
      {error && <div className="text-sm mt-1 text-red-500">{error}</div>}
    </div>
  )
}
