"use client"

import React from "react"

import { FormControlLabel, Switch as MaterialSwitch } from "@mui/material" // Import Material UI components

interface SwitchProps {
  label: string
  checked: boolean
  setChecked: (state: boolean) => void
}

export const Switch = ({ label, checked, setChecked }: SwitchProps) => (
  <FormControlLabel
    control={
      <MaterialSwitch
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
        color="primary"
      />
    }
    label={label}
    labelPlacement="start"
  />
)
