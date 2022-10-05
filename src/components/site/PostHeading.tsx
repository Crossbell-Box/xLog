import { Element } from "react-scroll"

export const getPostHeading = (tagName: "h2" | "h3" | "h4" | "h5" | "h6") => {
  const PostHeading: React.FC<
    {
      children: React.ReactNode
    } & React.HTMLAttributes<HTMLHeadingElement>
  > = ({ children, ...props }) => {
    const Tag = tagName as any
    return (
      <>
        <Element name={props.id || ""}></Element>
        <Tag {...props}>{children}</Tag>
      </>
    )
  }

  return PostHeading
}
