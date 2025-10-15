import PortfolioEditor from "./portfolio-editor"
import PostEditor from "./post-editor"
import ShortEditor from "./short-editor"

export default async function SubdomainEditor(props: {
  searchParams?: Promise<{
    type: string
  }>
}) {
  const searchParams = await props.searchParams
  if (searchParams?.type === "portfolio") {
    return <PortfolioEditor />
  } else if (searchParams?.type === "short") {
    return <ShortEditor />
  } else {
    return <PostEditor />
  }
}
