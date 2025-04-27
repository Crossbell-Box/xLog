import Link from "next/link"

import { Button, Typography } from "@mui/material"

export type UniLinkProps = {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  target?: string
}

export const UniLink = ({
  href,
  onClick,
  children,
  className,
  target,
  ...props
}: UniLinkProps) => {
  if (onClick) {
    return (
      <Button
        variant="text" // Using Material UI's Button with text variant
        className={className}
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
    )
  }

  if (!href) {
    return (
      <Typography className={className} {...props}>
        {children}
      </Typography>
    )
  }

  const isExternal =
    (href && (/^https?:\/\//.test(href) || href.startsWith("/feed"))) ||
    href.startsWith("mailto:")

  const isInModal =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/post/")

  if (isExternal || isInModal) {
    return (
      <a
        {...props}
        className={className}
        href={href}
        target="_blank"
        rel="nofollow noreferrer"
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} target={target}>
      {children}
    </Link>
  )
}
