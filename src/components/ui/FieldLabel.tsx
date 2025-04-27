import React from "react"

import { FormControl, InputLabel } from "@mui/material" // Import MUI components

export const FieldLabel = ({ id, label }: { id?: string; label: string }) => {
  return (
    <FormControl fullWidth>
      <InputLabel htmlFor={id}>{label}</InputLabel>
    </FormControl>
  )
}
