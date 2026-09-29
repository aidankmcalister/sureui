import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import { llmsFull, llmsIndex, pageMarkdown } from "@/lib/site/llms"
import { siteUrl } from "@/lib/site/config"
import { pages } from "@/lib/site/docs"

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

  it("turns every example and install command into code", () => {
    for (const page of pages) {
      const markdown = pageMarkdown(page)
      expect(markdown).not.toContain("<Example")
      expect(markdown).not.toContain("<Install")
      expect(markdown).not.toContain("useActions")
      expect(markdown).not.toContain("useAutoReset")
      expect(markdown).not.toContain("](/docs")
    }
  })

  it("includes every page in the full text", () => {
    const full = llmsFull()
    for (const page of pages) {
      expect(full).toContain(`# ${page.title}\n\n${page.description}`)
    }
  })
})
