import fs from "node:fs"

import registry from "@/registry.json"

type Item = (typeof registry.items)[number]

function exportedNames(item: Item) {
  const file = item.files.find((entry) =>
    entry.path.endsWith(`/${item.name}.tsx`)
  )
  if (!file) return []
  const source = fs.readFileSync(file.path, "utf8")
  return (/export \{([^}]*)\}/.exec(source)?.[1] ?? "")
    .split(",")
    .map((name) => name.trim())
    .filter((name) => name && !name.startsWith("type "))
}

export const components = registry.items
  .filter((item) => item.type === "registry:ui")
  .map((item) => ({
    name: item.name,
    title: item.title,
    exports: exportedNames(item),
  }))

export const componentExports = new Set(
  components.flatMap((component) => component.exports)
)

export const blocks = registry.items
  .filter((item) => item.type === "registry:block")
  .map((item) => ({
    name: item.name,
    title: item.title,
    description: item.description,
    files: item.files.map((file) => ({
      path: file.path,
      name: file.target.replace("@components/", ""),
    })),
  }))

export type Block = (typeof blocks)[number]
