import PortfolioEditor from "./portfolio-editor"
import PostEditor from "./post-editor"

export default function SubdomainEditor({
  searchParams,
}: {
  searchParams?: {
    type: string
  }
}) {
  if (searchParams?.type === "portfolio") {
    return <PortfolioEditor />
  } else {
    return <PostEditor />
  }
}
