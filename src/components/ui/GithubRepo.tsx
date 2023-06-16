export default async function GithubRepo({ repo }: { repo: string }) {
  const { GithubRepo: ReactGithubRepo } = await import("@birdgg/react-github")

  return <ReactGithubRepo repo={repo} />
}
