import React from "react"
import clsx from "clsx"

export const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isLoading?: boolean
    isBlock?: boolean
    variant?: "primary" | "secondary" | "text"
    variantColor?: "green" | "red" | "gray"
    size?: "sm"
    rounded?: "full" | "lg"
  }
> = ({
  type,
  children,
  className,
  isLoading,
  isBlock,
  variant,
  variantColor,
  size,
  rounded,
  ...props
}) => {
  return (
    <button
      {...props}
      type={type || "button"}
      className={clsx(
        className,
        "button",
        isLoading && "is-loading",
        isBlock && `is-block`,
        variantColor && `is-${variantColor}`,
        size && `is-${size}`,
        `is-${variant || "primary"}`,
        rounded === "full" ? "rounded-full" : "rounded-lg"
      )}
    >
      {children}
    </button>
  )
}
