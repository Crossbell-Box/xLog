import dynamic from "next/dynamic"

const ReactGithubRepo = dynamic(
  async () => (await import("@birdgg/react-github")).GithubRepo,
)

export default function GithubRepo({ repo }: { repo: string }) {
  return <ReactGithubRepo repo={repo} />
}
