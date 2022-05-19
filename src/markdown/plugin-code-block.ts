import Markdown from "markdown-it"
import Prism from "prismjs"
import loadLanguages from "prismjs/components/index"

export const pluginCodeBlock = (md: Markdown) => {
  const highlight = (code: string, lang: string) => {
    if (lang === "vue" || lang === "svelte") {
      lang = "html"
    }
    loadLanguages(lang)
    const grammer = Prism.languages[lang]
    const html = grammer
      ? `<pre><code>${Prism.highlight(code, grammer, lang)}</code></pre>`
      : `<pre><code>${md.utils.escapeHtml(code)}</code></pre>`

    return html
  }

  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const code = highlight(token.content, token.info)
    return `<div class="code" data-lang="${token.info}">${code}</div>`
  }
}
