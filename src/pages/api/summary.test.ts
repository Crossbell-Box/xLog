import { describe, expect, test } from "vitest"
import removeMarkdown from "remove-markdown"

describe("remove markdown", () => {
  test("remove image url but keep alt", () => {
    expect(
      removeMarkdown("![alt text](https://i.imgur.com/1ZQ3Q2l.jpg)", {
        useImgAltText: true,
        gfm: true,
      }),
    ).toBe("alt text")
  })

  test("test markdown", () => {
    expect(
      removeMarkdown(
        `# Heading 1
用 CSS 变量的颜色值。而 xLog 真巧使用了 Tailwind，基本上所有的颜色应用场景都用了 Tailwind 自带的色值，但由于 Tailwind 本身自带的色值都是一个 [固定的值](https://tailwindcss.com/docs/customizing-colors)，并不支持根据 Dark Mode 切换色值。

于是我萌生了一个想法，让自带的颜色能根据是否是暗黑模式去切换就行了。

首先第一是，要重新配置 Tailwind，覆写原来内置的所有的颜色，把固定的值全部改写成 CSS 变量。变量的前缀可以自定义，不要冲突就行了，这边就暂定为 \`tw-colors-i\`。比如我们需要类似这样的色值配置：

\`\`\`js
// tailwind.config.ts
module.exports = {
  theme: {
    colors: {
      slate: {
        50: 'rgb(var(--tw-colors-i-slate-50))',
        100: 'rgb(var(--tw-colors-i-slate-100))',
        // ...
      },
    },
  },
}

\`\`\``,
        {
          useImgAltText: true,
          gfm: true,
        },
      ),
    ).toMatchInlineSnapshot(`
      "Heading 1
      用 CSS 变量的颜色值。而 xLog 真巧使用了 Tailwind，基本上所有的颜色应用场景都用了 Tailwind 自带的色值，但由于 Tailwind 本身自带的色值都是一个 固定的值，并不支持根据 Dark Mode 切换色值。

      于是我萌生了一个想法，让自带的颜色能根据是否是暗黑模式去切换就行了。

      首先第一是，要重新配置 Tailwind，覆写原来内置的所有的颜色，把固定的值全部改写成 CSS 变量。变量的前缀可以自定义，不要冲突就行了，这边就暂定为 tw-colors-i。比如我们需要类似这样的色值配置：

      // tailwind.config.ts
      module.exports = {
        theme: {
          colors: {
            slate: {
              50: 'rgb(var(--tw-colors-i-slate-50))',
              100: 'rgb(var(--tw-colors-i-slate-100))',
              // ...
            },
          },
        },
      }

      \`"
    `)
  })
})
