import MarkdownIt from "markdown-it"
import { stripHTML } from "~/lib/utils"
import { MarkdownEnv } from "."

export const pluginExcerpt = (md: MarkdownIt) => {
  md.renderer.rules.paragraph_close = (
    tokens,
    idx,
    options,
    env: MarkdownEnv,
    self
  ) => {
    if (!env.__internal.excerpted) {
      env.__internal.excerpted = true
      let startIndex = 0
      for (const [index, token] of tokens.entries()) {
        if (token.type === "paragraph_open") {
          startIndex = index
          break
        }
      }
      env.excerpt = stripHTML(
        self.render(tokens.slice(startIndex, idx + 1), options, env)
      )
    }

    return self.renderToken(tokens, idx, options)
  }
}
