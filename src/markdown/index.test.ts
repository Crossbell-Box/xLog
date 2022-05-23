import { test } from "uvu"
import assert from "uvu/assert"
import { renderPageContent } from "./index"

test("simple", async () => {
  const { contentHTML, excerpt } = await renderPageContent(`
# Hello

This is the **excerpt**
  
> Hello Blockquote <sup>foo</sup>

- [ ] task list 
- [x] done

<script>alert('xss')</script>

<img src="foo.png" alt="my image" onerror="console.log(1)" />

<figcaption><a href="https://example.com">my caption</a></figcaption>

<img src />

\`\`\`js
function foo() {}

<script>alert('xss')</script>
\`\`\`

\`\`\`
<script>alert('xss')</script>
\`\`\`
  `)

  assert.not.match(contentHTML, /<script>/)
  assert.equal(excerpt, `This is the excerpt`)
})

test("wrap table", async () => {
  const { contentHTML } = await renderPageContent(`
|a|b|
|---|---|
|c|d|  
  `)
  assert.match(contentHTML, `<div class="table-wrapper">`)
})

test("callout", async () => {
  const { contentHTML } = await renderPageContent(`
> TIP:
> Some tip!

> WARN:
>
> Some warning!
  `)
  console.log(contentHTML)
})

test.run()
