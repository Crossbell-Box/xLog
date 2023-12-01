import PortfolioEditor from "./portfolio-editor"
import PostEditor from "./post-editor"
import ShortEditor from "./short-editor"

export default function SubdomainEditor({
  searchParams,
}: {
  searchParams?: {
    type: string
  }
}) {
  if (searchParams?.type === "portfolio") {
    return <PortfolioEditor />
  } else if (searchParams?.type === "short") {
    return <ShortEditor />
  } else {
    return <PostEditor />
  }
}
