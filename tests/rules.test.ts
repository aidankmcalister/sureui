import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

import registry from "@/registry.json"
import prompts from "@/tests/fixtures/rules-prompts.json"
import { addArgs } from "@/lib/site/config"
import { ruleFiles, rulesBody } from "@/lib/site/rules"
import { styles } from "@/lib/site/styles"

describe("agent rules", () => {
  it.each(ruleFiles)("$path is up to date (run pnpm rules)", (file) => {
    expect(readFileSync(file.path, "utf8")).toBe(file.content)
  })

  it("the rules item installs every generated file", () => {
    const item = registry.items.find((entry) => entry.name === "rules")!
    expect(item.files.map(({ path, target }) => ({ path, target }))).toEqual(
      ruleFiles.map(({ path, target }) => ({ path, target }))
    )
  })

  it("the skill has a name and a description", () => {
    const skill = ruleFiles.find((file) => file.path.endsWith("SKILL.md"))!
    expect(skill.content).toMatch(/^---\nname: sureui\ndescription: .+\n---\n/)
  })

  it.each(styles)("covers $name", (style) => {
    const body = rulesBody()
    expect(body).toContain(style.question)
    expect(body).toContain(`### ${style.name}`)
    expect(body).toContain(addArgs(style.items))
    for (const line of style.useWhen) expect(body).toContain(line)
  })

  it("expects one of the styles for every sample prompt", () => {
    const slugs = styles.map((style) => style.slug)
    for (const { expected } of prompts) expect(slugs).toContain(expected)
    expect(new Set(prompts.map(({ expected }) => expected))).toEqual(
      new Set(slugs)
    )
  })
})
