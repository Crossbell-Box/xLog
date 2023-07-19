import { match } from "path-to-regexp"

import type { Transformer } from "../rehype-embed"
import { isHostIncludes } from "./utils"

export const GitHubRepoTransformer: Transformer = {
  name: "GithubRepo",
  shouldTransform(url) {
    const { host } = url

    return isHostIncludes("github.com", host)
  },
  getHTML(url) {
    const matched = match<{ user: string; repo: string }>("/:user/:repo")(
      url.pathname,
    )
    if (!matched) return
    const repo = `${matched.params.user}/${matched.params.repo}`
    return `<github-repo repo="${repo}"/>`
  },
}
