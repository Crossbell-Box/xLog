import { nanoid } from "nanoid"
import { useTranslations } from "next-intl"
import React, {
  ChangeEvent,
  Dispatch,
  FocusEvent,
  SetStateAction,
  useMemo,
  useState,
} from "react"

import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material" // MUI imports

export type RadioItem = {
  text: string
  value?: string
  default?: boolean
}

export const BoxRadio = ({
  value,
  setValue,
  items,
}: {
  value: string
  setValue: Dispatch<SetStateAction<string>>
  items: RadioItem[]
}) => {
  const t = useTranslations()
  const randomId = useMemo(() => nanoid(), [])
  const [isCustom, setIsCustom] = useState(false)

  const toCustom = (
    e: ChangeEvent<HTMLInputElement> | FocusEvent<HTMLInputElement>,
  ) => {
    setIsCustom(true)
    setValue(e.target.value)
  }

  const toDefined = (e: ChangeEvent<HTMLInputElement>) => {
    setIsCustom(false)
    setValue(e.target.value)
  }

  return (
    <Box
      sx={{ display: "grid", gap: 2, gridTemplateColumns: "repeat(3, 1fr)" }}
    >
      <RadioGroup
        value={value}
        onChange={toDefined}
        sx={{ display: "flex", gap: 2 }}
      >
        {items.map((item) => {
          return (
            <div key={item.value || item.text} className="relative">
              {item.value ? (
                <FormControlLabel
                  control={
                    <Radio
                      id={`${randomId}-${item.value}`}
                      name={randomId}
                      value={item.value}
                      checked={value === item.value}
                      onChange={toDefined}
                      sx={{
                        "&.Mui-checked": {
                          color: "accent.main",
                        },
                      }}
                    />
                  }
                  label={t(item.text)}
                  sx={{
                    "& .MuiFormControlLabel-label": {
                      textAlign: "center",
                    },
                  }}
                />
              ) : (
                <FormControl fullWidth>
                  <TextField
                    variant="outlined"
                    placeholder={t(item.text) || ""}
                    value={value}
                    onChange={toCustom}
                    onFocus={toCustom}
                    sx={{
                      backgroundColor: isCustom ? "grey.100" : "transparent",
                      borderColor: isCustom ? "accent.main" : "transparent",
                      "& .MuiInputBase-root": {
                        textAlign: "center",
                      },
                    }}
                  />
                </FormControl>
              )}
            </div>
          )
        })}
      </RadioGroup>
    </Box>
  )
}
