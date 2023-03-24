import Link from "next/link"

export const UniLink: React.FC<{
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  target?: string
}> = ({ href, onClick, children, className, target, ...props }) => {
  if (onClick) {
    return (
      <button className={className} onClick={onClick} {...props}>
        {children}
      </button>
    )
  }

  if (!href) {
    return <span className={className}>{children}</span>
  }

  const isExternal =
    href && (/^https?:\/\//.test(href) || href.startsWith("/feed"))

  if (isExternal) {
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
