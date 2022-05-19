import MarkdownIt from "markdown-it"

export const pluginTable = (md: MarkdownIt) => {
  md.renderer.rules.table_open = (tokens, idx, options, env, self) => {
    return `<div class="table-wrapper">${self.renderToken(
      tokens,
      idx,
      options
    )}`
  }
  md.renderer.rules.table_close = (tokens, idx, options, env, self) => {
    return `${self.renderToken(tokens, idx, options)}</div>`
  }
}
