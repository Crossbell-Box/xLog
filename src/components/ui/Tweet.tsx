import dynamic from "next/dynamic"
import Image from "next/image"
import type { TwitterComponents } from "react-tweet"

import { Box, Typography } from "@mui/material" // Import Material UI components

import { SITE_URL } from "~/lib/env"

const ReactTweet = dynamic(async () => (await import("react-tweet")).Tweet)

const components: TwitterComponents = {
  AvatarImg: (props) => <Image {...props} alt="avatar" />,
  MediaImg: (props) => <Image {...props} fill unoptimized alt="tweet-media" />,
}

export default function Tweet({
  id,
  fullUrl,
}: {
  id: string
  fullUrl: string
}) {
  return (
    <Box
      sx={{
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "white",
      }}
    >
      <ReactTweet
        id={id}
        components={components}
        apiUrl={`${SITE_URL}/api/tweet?id=${id}`}
        fallback={
          <Typography variant="body2" color="textSecondary">
            {fullUrl}
          </Typography>
        }
      />
    </Box>
  )
}
