import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { docsSource, headings, pageAt, pages } from "@/lib/site/docs"

function linksIn(from: string, source: string) {
  return [...source.matchAll(/\]\((\/docs[^)\s]*)\)/g)].map(([, href]) => ({
    from,
    href,
  }))
}

const links = [
  ...pages.flatMap((page) => linksIn(page.slug, docsSource(page.slug))),
  ...linksIn("changelog", readFileSync("content/changelog.mdx", "utf8")),
]

describe("docs links", () => {
  it("finds links to check", () => {
    expect(links.length).toBeGreaterThan(20)
  })

  it.each(links)("$from links to $href", ({ href }) => {
    const [path, anchor] = href.split("#")
    const page = pageAt(path)
    expect(page, `no page at ${path}`).toBeDefined()
    if (anchor) {
      expect(headings(page!.slug).map((heading) => heading.id)).toContain(
        anchor
      )
    }
  })
})
