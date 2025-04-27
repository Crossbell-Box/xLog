import type { ExtraProps } from "hast-util-to-jsx-runtime"
import React, {
  type ClassAttributes,
  type FC,
  type HTMLAttributes,
} from "react"

import { Typography } from "@mui/material" // Material UI Typography

export const createMarkdownHeaderComponent = (tag: string) => {
  const MarkdownHeader: FC<
    ClassAttributes<HTMLHeadingElement> &
      HTMLAttributes<HTMLHeadingElement> &
      ExtraProps
  > = ({ children, ...rest }) => {
    const Tag = tag as any

    return (
      <Typography
        variant={tag as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"}
        component={Tag}
        {...rest}
      >
        {children}
        <a
          className="xlog-anchor"
          tabIndex={-1}
          href={rest.id ? `#${rest.id}` : undefined}
        >
          #
        </a>
      </Typography>
    )
  }

  return MarkdownHeader
}
