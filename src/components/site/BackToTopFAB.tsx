import { SVGProps, useEffect, useState } from "react"

import { FABBase } from "../ui/FAB"

function BxBxsArrowToTop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <path d="M6 4h12v2H6zm5 10v6h2v-6h5l-6-6l-6 6z" fill="currentColor" />
    </svg>
  )
}

// export const BackToTopFABIndicator: React.FC<{ show: boolean }> = (props) => {
//   useEffect(() => {
//     const handler = () => {
//       const scrollTop = document.documentElement.scrollTop
//       useFabContextState.setState({
//         isOverFirstScreen: scrollTop > document.documentElement.clientHeight,
//       })
//     }

//     document.documentElement.addEventListener("scroll", handler)
//     return () => {
//       document.documentElement.removeEventListener("scroll", handler)
//     }
//   }, [])

//   return null
// }
const isShouldShow = () =>
  document.documentElement.scrollTop > document.documentElement.clientHeight
export const BackToTopFAB: React.FC<{}> = () => {
  const [shouldShow, setShouldShow] = useState(isShouldShow())
  useEffect(() => {
    const handler = () => {
      setShouldShow(isShouldShow())
    }

    document.addEventListener("scroll", handler)
    return () => {
      document.removeEventListener("scroll", handler)
    }
  }, [])

  return (
    <FABBase
      id="to-top"
      show={shouldShow}
      onClick={() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }}
    >
      <BxBxsArrowToTop />
    </FABBase>
  )
}
