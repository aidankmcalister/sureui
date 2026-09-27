import { readFileSync } from "node:fs"
import { basename } from "node:path"
import { describe, expect, it } from "vitest"

import registry from "@/registry.json"

describe("registry", () => {
  const allFiles = registry.items.flatMap((item) => item.files)
  const components = allFiles.filter((file) => file.type === "registry:ui")

  it.each(components)("$path is a client component", ({ path }) => {
    expect(readFileSync(path, "utf8").startsWith('"use client"')).toBe(true)
  })

  it.each(allFiles)(
    "$path lives in components/ui/sureui and targets @ui/sureui",
    ({ path, target }) => {
      expect(path.startsWith("components/ui/sureui/")).toBe(true)
      expect(target).toBe(`@ui/sureui/${basename(path)}`)
    }
  )

  it.each(registry.items)(
    "$name lists every components/ui/sureui import it uses",
    (item) => {
      const filePaths = item.files.map((file) => file.path)
      const names = new Set(
        filePaths.map((path) => basename(path).replace(/\.tsx?$/, ""))
      )
      for (const path of filePaths) {
        const content = readFileSync(path, "utf8")
        for (const [, name] of content.matchAll(
          /@\/components\/ui\/sureui\/([\w-]+)/g
        )) {
          expect(names.has(name)).toBe(true)
        }
      }
    }
  )

  it.each(registry.items)(
    "$name declares every stock component and package it imports",
    (item) => {
      const stock =
        "registryDependencies" in item ? item.registryDependencies : []
      const packages = "dependencies" in item ? item.dependencies : []
      for (const { path } of item.files) {
        const content = readFileSync(path, "utf8")
        for (const [, name] of content.matchAll(
          /from "@\/components\/ui\/([\w-]+)"/g
        )) {
          expect(stock).toContain(name)
        }
        for (const [, name] of content.matchAll(/from "([^@./][^"]*)"/g)) {
          if (name !== "react") expect(packages).toContain(name)
        }
        expect(content.includes('from "cn"')).toBe(false)
      }
    }
  )
})
