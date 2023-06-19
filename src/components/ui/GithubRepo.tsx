import { memo } from "react"

import { GithubRepo as ReactGithubRepo } from "@birdgg/react-github"

export default memo(function GithubRepo({ repo }: { repo: string }) {
  return <ReactGithubRepo repo={repo} />
})
