import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const contentDir = path.join(process.cwd(), "content")

function mdxFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(dir, entry.name)
    if (entry.isDirectory()) return mdxFiles(file)
    return entry.name.endsWith(".mdx") ? [file] : []
  })
}

function codeLines(source: string) {
  return [...source.matchAll(/```\w*\n([\s\S]*?)```/g)].flatMap((match) =>
    match[1].split("\n")
  )
}

describe("docs code blocks", () => {
  it.each(mdxFiles(contentDir).map((file) => path.relative(contentDir, file)))(
    "%s has no line starting with a stray semicolon",
    (file) => {
      const lines = codeLines(
        fs.readFileSync(path.join(contentDir, file), "utf8")
      )
      expect(lines.filter((line) => line.startsWith(";"))).toEqual([])
    }
  )
})
