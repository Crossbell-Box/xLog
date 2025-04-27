"use client"

import { useTranslations } from "next-intl"
import { useEffect, useState } from "react"

import { Box, CircularProgress, Typography } from "@mui/material"

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h6">{t("Current Block Height")}</Typography>
      {realBlockNumber === null ? (
        <CircularProgress size={24} sx={{ marginTop: 2 }} />
      ) : (
        <AnimatedNumber
          animateToNumber={realBlockNumber || blockNumber || 0}
          includeComma={true}
          height={24}
        />
      )}
    </Box>
  )
}
