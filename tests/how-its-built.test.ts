import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import { howItsBuilt } from "@/lib/site/how-its-built"
import { pageMarkdown } from "@/lib/site/llms"
import { getPage } from "@/lib/site/pages"

function unindent(source: string) {
  return source
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
}

const excerpts = howItsBuilt.sections.flatMap((section) =>
  section.excerpt ? [{ label: section.label, ...section.excerpt }] : []
)

describe("how it's built", () => {
  it.each(excerpts)("the $label excerpt is real $file source", (excerpt) => {
    expect(unindent(readFileSync(excerpt.file, "utf8"))).toContain(
      unindent(excerpt.source)
    )
  })

  it("names every state the core has", () => {
    const core = readFileSync("components/ui/sureui/confirmation.ts", "utf8")
    const union = /type ConfirmationState =([^\n]*\n[^\n]*)/.exec(core)![1]
    const names = [...union.matchAll(/"(\w+)"/g)].map(([, name]) => name)
    expect(howItsBuilt.states.notes.map((state) => state.name)).toEqual(names)
  })

  it("is in llms.txt with every section and excerpt", () => {
    const markdown = pageMarkdown(getPage("/docs/how-its-built")!)
    for (const section of howItsBuilt.sections) {
      expect(markdown).toContain(`## ${section.label}`)
      if (section.excerpt) expect(markdown).toContain(section.excerpt.source)
    }
    for (const state of howItsBuilt.states.notes) {
      expect(markdown).toContain(`\`${state.name}\`: ${state.note}`)
    }
  })
})
