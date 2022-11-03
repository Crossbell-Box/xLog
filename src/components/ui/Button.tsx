import React from "react"
import clsx from "clsx"

export const ButtonGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="button-group">{children}</div>
}

export type Variant =
  | "primary"
  | "secondary"
  | "text"
  | "like"
  | "collect"
  | "crossbell"

type ButtonProps = {
  isLoading?: boolean
  isBlock?: boolean
  isDisabled?: boolean
  isAutoWidth?: boolean
  variant?: Variant
  variantColor?: "green" | "red" | "gray"
  size?: "sm" | "xl"
  rounded?: "full" | "lg"
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps
>(function Button(
  {
    type,
    children,
    className,
    isLoading,
    isDisabled,
    isBlock,
    variant,
    variantColor,
    size,
    rounded,
    isAutoWidth,
    ...props
  },
  ref,
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type || "button"}
      disabled={isDisabled || isLoading}
      className={clsx(
        className,
        "button",
        isLoading && "is-loading",
        isBlock && `is-block`,
        variantColor && `is-${variantColor}`,
        isDisabled && `is-disabled`,
        isAutoWidth && `is-auto-width`,
        size && `is-${size}`,
        `is-${variant || "primary"}`,
        rounded === "full" ? "rounded-full" : "rounded-lg",
      )}
    >
      {children}
    </button>
  )
})
