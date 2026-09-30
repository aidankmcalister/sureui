import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import { choose, everyAnswer } from "@/lib/site/choose"
import { headings, pageAt } from "@/lib/site/docs"

const items = registry.items.filter((item) => item.type !== "registry:block")

describe("choosing a control", () => {
  it.each(everyAnswer())(
    "%o ends in a real item and docs section",
    (answers) => {
      const choice = choose(answers)
      expect(items.map((item) => item.name)).toContain(choice.item)
      const [path, anchor] = choice.href.split("#")
      const page = pageAt(path)
      expect(page).toBeDefined()
      if (anchor) {
        expect(headings(page!.slug).map((heading) => heading.id)).toContain(
          anchor
        )
      }
    }
  )
})

describe("the agent skill", () => {
  const dir = path.join(process.cwd(), "skills/sureui")
  const files = [
    "SKILL.md",
    ...fs.readdirSync(path.join(dir, "rules")).map((file) => `rules/${file}`),
  ]
  const read = (file: string) => fs.readFileSync(path.join(dir, file), "utf8")

  it("lists every item", () => {
    const skill = read("SKILL.md")
    for (const item of items) expect(skill).toContain(`- \`${item.name}\`: `)
  })

  it.each(files)("%s links only to files and pages that exist", (file) => {
    const text = read(file)
    for (const [, link] of text.matchAll(/\]\((\.\/[^)]+)\)/g)) {
      expect(fs.existsSync(path.join(dir, path.dirname(file), link))).toBe(true)
    }
    for (const [, href] of text.matchAll(
      /https:\/\/sureui\.com(\/docs\/[\w-]+)/g
    )) {
      expect(pageAt(href)).toBeDefined()
    }
  })
})
