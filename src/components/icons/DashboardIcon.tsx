import React from "react"

export const DashboardIcon: React.FC<React.ComponentPropsWithoutRef<"svg">> = (
  props,
) => {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M3 3h7v9H3zm11 0h7v5h-7zm0 9h7v9h-7zM3 16h7v5H3z"
      ></path>
    </svg>
  )
}
