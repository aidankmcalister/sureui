import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { describe, expect, it } from "vitest"

import registry from "@/registry.json"

type Item = (typeof registry.items)[number]

function stockOf(item: Item) {
  return "registryDependencies" in item ? item.registryDependencies : []
}

function packagesOf(item: Item) {
  return "dependencies" in item ? item.dependencies : []
}

function importsOf(path: string) {
  const content = readFileSync(path, "utf8")
  return [...content.matchAll(/from "([^"]+)"/g)].map(([, name]) => name)
}

describe("registry", () => {
  const items = registry.items.filter((item) => item.type !== "registry:item")
  const controls = items.filter((item) => item.type !== "registry:block")
  const blocks = items.filter((item) => item.type === "registry:block")
  const allFiles = controls.flatMap((item) => item.files)
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

  it.each(controls)(
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

  it.each(items)(
    "$name declares every stock component and package it imports",
    (item) => {
      const stock = stockOf(item)
      const packages = packagesOf(item)
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

  it.each(blocks)("$name ships from components/blocks/$name", (item) => {
    expect(item.name).toMatch(/^[a-z-]+-\d{2}$/)
    for (const { path, type, target } of item.files) {
      expect(path.startsWith(`components/blocks/${item.name}/`)).toBe(true)
      expect(["registry:component", "registry:lib"]).toContain(type)
      const root = type === "registry:lib" ? "@lib" : "@components"
      expect(target).toBe(`${root}/${basename(path)}`)
      if (type === "registry:component") {
        expect(readFileSync(path, "utf8").startsWith('"use client"')).toBe(true)
      }
    }
  })

  it.each(blocks)(
    "$name ships or declares every local import it uses",
    (item) => {
      const stock = stockOf(item)
      const sureui = stock
        .filter((name) => name.startsWith("@sureui/"))
        .map((name) => {
          const dependency = registry.items.find(
            (other) => `@sureui/${other.name}` === name
          )
          expect(dependency, name).toBeDefined()
          return dependency!
        })
      const provided = sureui.flatMap((dependency) =>
        dependency.files.map((file) => file.path.replace(/\.tsx?$/, ""))
      )
      const shipped = item.files.map((file) => file.path.replace(/\.tsx?$/, ""))

      for (const { path } of item.files) {
        for (const name of importsOf(path)) {
          if (name.startsWith("@/components/ui/sureui/")) {
            expect(provided, name).toContain(name.slice(2))
          } else if (name.startsWith("./")) {
            const local = join(dirname(path), name)
            expect(shipped, name).toContain(local)
            expect(
              existsSync(`${local}.tsx`) || existsSync(`${local}.ts`)
            ).toBe(true)
          } else if (name.startsWith("@/")) {
            expect(
              name === "@/lib/utils" ||
                /^@\/components\/ui\/[\w-]+$/.test(name),
              name
            ).toBe(true)
          } else {
            expect(name.startsWith("../"), name).toBe(false)
          }
        }
      }
    }
  )
})
