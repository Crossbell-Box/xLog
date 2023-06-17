import { GithubRepo as ReactGithubRepo } from "@birdgg/react-github"

export default function GithubRepo({ repo }: { repo: string }) {
  return <ReactGithubRepo repo={repo} />
}
