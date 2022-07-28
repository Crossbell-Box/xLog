import React from "react"
import clsx from "clsx"

export const ButtonGroup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <div className="button-group">{children}</div>
}

type ButtonProps = {
  isLoading?: boolean
  isBlock?: boolean
  isDisabled?: boolean
  isAutoWidth?: boolean
  variant?: "primary" | "secondary" | "text" | "rss3" | "crossbell"
  variantColor?: "green" | "red" | "gray"
  size?: "sm"
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
  ref
) {
  return (
    <button
      {...props}
      ref={ref}
      type={type || "button"}
      disabled={isDisabled}
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
        rounded === "full" ? "rounded-full" : "rounded-lg"
      )}
    >
      {children}
    </button>
  )
})
