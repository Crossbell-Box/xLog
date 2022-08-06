import React from "react"

export const MoreIcon: React.FC<React.ComponentPropsWithoutRef<"svg">> = (
  props
) => {
  return (
    <svg
      {...props}
      width="1em"
      height="1em"
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  )
}
