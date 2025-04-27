"use client"

import { useTranslations } from "next-intl"

// Define a Material-UI icon (or you can import your own)
import GhostIcon from "@mui/icons-material/SentimentDissatisfied" // Example of using a Material UI icon
import { Box, SvgIcon, Typography } from "@mui/material" // Import MUI components

export const EmptyState = ({ resource = "post" }: { resource?: string }) => {
  const t = useTranslations()

  return (
    <Box
      sx={{
        textAlign: "center",
        py: 10,
        mb: 10,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "text.secondary",
      }}
    >
      <SvgIcon component={GhostIcon} sx={{ fontSize: 40, mb: 2 }} />{" "}
      {/* Material UI Icon */}
      <Typography
        variant="h5"
        sx={{ textTransform: "capitalize", fontWeight: "medium" }}
      >
        {t(`No ${resource.charAt(0).toUpperCase() + resource.slice(1)} Yet`)}
      </Typography>
    </Box>
  )
}
