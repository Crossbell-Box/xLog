"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import AnimatedNumber from "~/components/common/AnimatedNumber"
import { useGetBlockNumber } from "~/queries/site"

export const BlockNumber = () => {
  const t = useTranslations()

  const [realBlockNumber, setRealBlockNumber] = useState<number | null>(null)
  const { data: blockNumber } = useGetBlockNumber()

  useEffect(() => {
    if (blockNumber) {
      setRealBlockNumber(blockNumber)
    }
  }, [blockNumber])

  useEffect(() => {
    const interval = setInterval(() => {
      setRealBlockNumber((prevCount) => {
        if (prevCount) {
          return prevCount + 1
        }
        return null
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center">
      {t("Current Block Height")}
      <AnimatedNumber
        animateToNumber={realBlockNumber || blockNumber || 0}
        includeComma={true}
        height={24}
      ></AnimatedNumber>
    </div>
  )
}
