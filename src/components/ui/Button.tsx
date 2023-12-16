"use client"

import React, { memo } from "react"

import { cn } from "~/lib/utils"

/* eslint-disable react/prop-types */

export const ButtonGroup = ({ children }: { children: React.ReactNode }) => {
  return <div className="button-group">{children}</div>
}

export type Variant =
  | "primary"
  | "secondary"
  | "text"
  | "like"
  | "collect"
  | "crossbell"
  | "outline"
  | "tip"
  | "comment"
  | "share"

export type VariantColor =
  | "green"
  | "red"
  | "gray"
  | "gradient"
  | "black"
  | "light"

type ButtonProps = {
  isLoading?: boolean
  isBlock?: boolean
  isDisabled?: boolean
  isAutoWidth?: boolean
  variant?: Variant
  variantColor?: VariantColor
  outlineColor?: VariantColor
  size?: "sm" | "xl" | "2xl"
  rounded?: "full" | "lg"
}

export const Button = memo(
  React.forwardRef<
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
      outlineColor,
      size,
      rounded,
      isAutoWidth,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & ButtonProps,
    ref,
  ) {
    return (
      <button
        {...props}
        ref={ref}
        type={type || "button"}
        disabled={isDisabled || isLoading}
        // eslint-disable-next-line tailwindcss/no-custom-classname
        className={cn(
          className,
          "button",
          isLoading && "is-loading",
          isBlock && `is-block`,
          variantColor && `is-${variantColor}`,
          variant === "outline" && outlineColor && `is-outline-${outlineColor}`,
          isDisabled && `is-disabled`,
          isAutoWidth && `is-auto-width`,
          size && `is-${size}`,
          `is-${variant || "primary"}`,
          "rounded-full",
          // rounded === "full" ? "rounded-full" : "rounded-lg",
        )}
      >
        {children}
      </button>
    )
  }),
)
