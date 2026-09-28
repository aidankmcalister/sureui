import fs from "node:fs"
import path from "node:path"

import {
  controlSlot,
  type Control,
  type ControlValue,
  type ControlValues,
} from "@/lib/site/controls"

const contentDir = path.join(process.cwd(), "content/docs")
const examplesDir = path.join(process.cwd(), "components/site/docs/examples")

type SectionMeta = { title: string; pages: string[] }

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"))
}

const sections = readJson<{ sections: string[] }>("meta.json").sections.map(
  (folder) => ({
    folder,
    ...readJson<SectionMeta>(path.join(folder, "meta.json")),
  })
)

export type Page = {
  slug: string
  href: string
  title: string
  description: string
  group: string
  section: string
  sheet: string
}

function sectionOf(slug: string) {
  const section = sections.find((item) => item.pages.includes(slug))
  if (!section) throw new Error(`No section lists the docs page "${slug}"`)
  return section.folder
}

export function docsSource(slug: string) {
  return fs.readFileSync(
    path.join(contentDir, sectionOf(slug), `${slug}.mdx`),
    "utf8"
  )
}

function frontmatter(source: string) {
  const block = /^---\n([\s\S]*?)\n---\n/.exec(source)?.[1] ?? ""
  return Object.fromEntries(
    block.split("\n").map((line) => {
      const [key, ...rest] = line.split(":")
      return [
        key.trim(),
        rest
          .join(":")
          .trim()
          .replace(/^"(.*)"$/, "$1"),
      ]
    })
  )
}

export function docsBody(source: string) {
  return source.replace(/^---\n[\s\S]*?\n---\n/, "").trim()
}

export const pages: Page[] = sections
  .flatMap((section) =>
    section.pages.map((slug) => ({
      slug,
      group: section.title,
      section: section.folder,
    }))
  )
  .map(({ slug, group, section }, index) => {
    const meta = frontmatter(docsSource(slug))
    return {
      slug,
      href: slug === "introduction" ? "/docs" : `/docs/${slug}`,
      title: meta.title,
      description: meta.description,
      group,
      section,
      sheet: String(index + 1).padStart(2, "0"),
    }
  })

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export type Heading = { depth: 2 | 3; text: string; id: string }

export function headings(slug: string): Heading[] {
  let fenced = false
  return docsSource(slug)
    .split("\n")
    .filter((line) => {
      if (line.startsWith("```")) fenced = !fenced
      return !fenced && /^###? /.test(line)
    })
    .map((line) => {
      const text = line.replace(/^###? /, "").replace(/`/g, "")
      return { depth: line.startsWith("### ") ? 3 : 2, text, id: slugify(text) }
    })
}

export function getPage(slug: string) {
  return pages.find((page) => page.slug === slug)
}

export function exampleNames(slug: string) {
  return [...docsSource(slug).matchAll(/<Example name="([^"]+)"/g)].map(
    (match) => match[1]
  )
}

export function exampleFile(name: string) {
  return fs.readFileSync(path.join(examplesDir, `${name}.tsx`), "utf8")
}

export function usesLog(name: string) {
  return exampleFile(name).includes("useLog()")
}

const controlCall = /control\("(\w+)", (\w+)\)/g

function parseControlValue(text: string): ControlValue {
  return text === "true" || (text !== "false" && Number(text))
}

export function exampleControls(name: string): Control[] {
  return [...exampleFile(name).matchAll(controlCall)].map(([, key, value]) => ({
    name: key,
    value: parseControlValue(value),
  }))
}

export function exampleSource(
  name: string,
  values: ControlValues = {},
  slots = false
) {
  const valueOf = (key: string, fallback: string) => {
    const value = values[key] ?? parseControlValue(fallback)
    return slots && typeof value === "number" ? controlSlot(key) : value
  }

  return exampleFile(name)
    .replace(/^"use client"\n+/, "")
    .replace(
      /^import \{[^}]*\} from "@\/components\/site\/docs\/preview"\n/m,
      ""
    )
    .replace(/^ *const log = useLog\(\)\n/m, "")
    .replace(/^ *const control = useControl\(\)\n/m, "")
    .replace(/\{\n\n+/g, "{\n")
    .replace(
      /^( *)(\w+)=\{control\("(\w+)", (\w+)\)\}\n/gm,
      (_, indent, prop, key, fallback) => {
        const value = valueOf(key, fallback)
        if (value === false) return ""
        return `${indent}${prop}${value === true ? "" : `={${value}}`}\n`
      }
    )
    .replace(controlCall, (_, key, fallback) => String(valueOf(key, fallback)))
    .replace(/\blog\(/g, "console.log(")
    .trim()
}
