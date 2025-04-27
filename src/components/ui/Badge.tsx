import React from "react"

import { Box, Typography } from "@mui/material" // MUI imports

export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 4px",
        backgroundColor: "yellow.400", // Material UI yellow
        color: "white",
        borderRadius: "4px",
        textTransform: "uppercase",
        fontWeight: "bold",
        fontSize: "12px",
        height: "20px",
        justifyContent: "center",
      }}
      className={className}
    >
      <Typography variant="body2" sx={{ fontWeight: "inherit" }}>
        {children}
      </Typography>
    </Box>
  )
}
