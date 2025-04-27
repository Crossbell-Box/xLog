import dynamic from "next/dynamic"

import { Box, CircularProgress, Typography } from "@mui/material" // Importing MUI components

const ReactGithubRepo = dynamic(
  async () => (await import("@birdgg/react-github")).GithubRepo,
  {
    loading: () => (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="100%"
      >
        <CircularProgress />
      </Box>
    ),
  },
)

export default function GithubRepo({ repo }: { repo: string }) {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Github Repository: {repo}
      </Typography>
      <ReactGithubRepo repo={repo} />
    </Box>
  )
}
