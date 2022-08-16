import Link from "next/link"

export const UniLink: React.FC<{
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}> = ({ href, onClick, children, className }) => {
  if (onClick) {
    return (
      <button className={className} onClick={onClick}>
        {children}
      </button>
    )
  }

  if (!href) {
    return <span className={className}>{children}</span>
  }

  const isExternal = href && /^https?:\/\//.test(href)

  if (isExternal) {
    return (
      <a
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
    <Link href={href}>
      <a className={className}>{children}</a>
    </Link>
  )
}
