import { SVGProps } from "react"

import { FABBase } from "../ui/FAB"

function BxBxsArrowToTop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path d="M6 4h12v2H6zm5 10v6h2v-6h5l-6-6l-6 6z" fill="currentColor" />
    </svg>
  )
}

export const BackToTopFAB: React.FC<{ show: boolean }> = (props) => {
  return (
    <FABBase
      onClick={() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }}
      aria-label="Back to top"
    >
      <BxBxsArrowToTop />
    </FABBase>
  )
}
