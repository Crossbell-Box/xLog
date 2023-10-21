import { nanoid } from "nanoid"
import { memo, useEffect, useRef, useState } from "react"

import { usePrevious } from "~/hooks/usePrevious"
import { cn } from "~/lib/utils"

const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]

const AnimatedNumber = memo(
  ({
    animateToNumber,
    includeComma,
    height,
    className,
  }: {
    animateToNumber: number
    includeComma?: boolean
    height?: number
    className?: string
  }) => {
    const keyCount = useRef(0)
    const animteTonumberString = includeComma
      ? Math.abs(animateToNumber).toLocaleString()
      : String(Math.abs(animateToNumber))
    const animateToNumbersArr = Array.from(animteTonumberString, Number).map(
      (x, idx) => (isNaN(x) ? animteTonumberString[idx] : x),
    )
    const prevAnimateToNumbersArr = usePrevious(animateToNumbersArr)

    const [numberHeight, setNumberHeight] = useState(height || 0)

    const numberDivRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      if (!numberHeight) {
        const currentHeight =
          numberDivRef.current?.getClientRects()?.[0]?.height
        if (currentHeight) {
          setNumberHeight(currentHeight)
        }
      }
    }, [numberDivRef, numberHeight])

    return (
      <>
        {numberHeight !== 0 && (
          <div className={cn("flex", className)}>
            {animateToNumber < 0 && <div>-</div>}
            {animateToNumbersArr.map((n, index) => {
              if (
                typeof n === "string" ||
                !prevAnimateToNumbersArr ||
                prevAnimateToNumbersArr[index] === n
              ) {
                return <div key={index}>{n}</div>
              }

              const from =
                -1 * (numberHeight * (prevAnimateToNumbersArr[index] as number))
              let to =
                -1 * (numberHeight * (animateToNumbersArr[index] as number))
              const id = nanoid()
              if (animateToNumbersArr[index] === 0) {
                to = -1 * (numberHeight * 10)
              }

              return (
                <div
                  key={index}
                  style={{
                    height: numberHeight,
                    overflow: "hidden",
                  }}
                >
                  {/* eslint-disable-next-line react/no-unknown-property */}
                  <style jsx>{`
                    @keyframes move${id} {
                      from {
                        transform: translateY(${from}px);
                      }
                      to {
                        transform: translateY(${to}px);
                      }
                    }
                  `}</style>
                  <div
                    key={`${keyCount.current++}`}
                    style={{
                      animation: `move${id} 0.3s ease-in-out forwards`,
                    }}
                  >
                    {NUMBERS.map((number, i) => (
                      <div key={i}>{number}</div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {!numberHeight && (
          <div ref={numberDivRef} style={{ position: "absolute", top: -9999 }}>
            {0}
          </div>
        )}
      </>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.animateToNumber === nextProps.animateToNumber &&
      prevProps.includeComma === nextProps.includeComma
    )
  },
)

AnimatedNumber.displayName = "AnimatedNumber"

export default AnimatedNumber
