import { FC } from "react"

import { Box, Typography } from "@mui/material" // MUI imports

import { noopArr } from "~/lib/noop"

import { Avatar } from "./Avatar"

interface AvatarStackProps {
  onClick?: () => void
  avatars: {
    name: string | null | undefined
    images: string[] | null | undefined
    cid: number | null | undefined
  }[]
  count: number

  /**
   * @default 3
   */
  showCount?: number
}

export const AvatarStack: FC<AvatarStackProps> = (props) => {
  const { avatars, count, onClick, showCount = 3 } = props
  return (
    <Box
      sx={{
        display: "flex",
        gap: -2,
        cursor: "pointer",
        flexWrap: "nowrap",
      }}
      onClick={onClick}
    >
      {avatars.slice(0, showCount).map((avatar) => {
        return (
          <Box
            key={avatar.name}
            sx={{ position: "relative", display: "inline-block" }}
          >
            <Avatar
              cid={avatar.cid}
              className="relative align-middle border-2 border-white"
              images={avatar.images || noopArr}
              name={avatar.name || ""}
              size={40}
            />
          </Box>
        )
      })}
      {count > showCount && (
        <Box
          sx={{
            position: "relative",
            display: "inline-block",
            border: "2px solid white",
            borderRadius: "50%",
            width: 40,
            height: 40,
            backgroundColor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            color: "text.secondary",
          }}
        >
          <Typography variant="caption">+{count - showCount}</Typography>
        </Box>
      )}
    </Box>
  )
}
