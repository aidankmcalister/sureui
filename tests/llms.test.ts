import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import { llmsFull, llmsIndex, pageMarkdown } from "@/components/site/llms"
import { pages, siteUrl, styles } from "@/components/site/styles"

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
})
