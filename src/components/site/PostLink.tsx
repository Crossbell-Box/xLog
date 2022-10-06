import { Link } from "react-scroll"

export const PostLink: React.FC<any> = ({ children, ...props }) => {
  if (props.href?.startsWith("#")) {
    return (
      <Link
        to={decodeURI(props.href.slice(1))}
        spy={true}
        smooth={true}
        duration={500}
        offset={-20}
        {...props}
      >
        {children}
      </Link>
    )
  } else {
    return <a {...props}>{children}</a>
  }
}
