import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import { blocks } from "@/lib/site/blocks"
import { llmsFull, llmsIndex, pageMarkdown } from "@/lib/site/llms"
import { siteUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/pages"
import { styles } from "@/lib/site/styles"

describe("llms.txt", () => {
  it("links every docs page and registry item", () => {
    const index = llmsIndex()
    for (const page of pages) {
      expect(index).toContain(`${siteUrl}/llms/${page.slug}.md`)
    }
    for (const item of registry.items) {
      expect(index).toContain(`${siteUrl}/r/${item.name}.json`)
    }
  })

  it("puts every prop of every style in its page", () => {
    for (const style of styles) {
      const page = pages.find((item) => item.slug === style.slug)!
      const markdown = pageMarkdown(page)
      for (const api of style.api) {
        for (const [name] of api.rows) {
          expect(markdown).toContain(`\`${name}\``)
        }
      }
    }
  })

  it("includes every page in the full text", () => {
    const full = llmsFull()
    for (const page of pages) {
      expect(full).toContain(`# ${page.title}\n\n${page.lead}`)
    }
  })

  it("lists every block in the index and the full text", () => {
    const names = registry.items
      .filter((item) => item.type === "registry:block")
      .map((item) => item.name)
    expect(blocks.map((block) => block.name).sort()).toEqual(names.sort())
    const index = llmsIndex()
    const full = llmsFull()
    for (const block of blocks) {
      expect(index).toContain(
        `${siteUrl}/r/${block.name}.json): ${block.description}`
      )
      expect(full).toContain(`## ${block.title}\n\n${block.description}`)
      expect(full).toContain(`npx shadcn@latest add @sureui/${block.name}`)
      for (const action of block.actions) {
        expect(full).toContain(`${action.action}: ${action.styleName}.`)
      }
    }
  })
})
