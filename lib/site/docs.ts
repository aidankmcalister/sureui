import fs from "node:fs"
import path from "node:path"

const contentDir = path.join(process.cwd(), "content/docs")
const examplesDir = path.join(process.cwd(), "components/site/docs/examples")

const groups = [
  { label: "Getting started", slugs: ["introduction", "installation"] },
  {
    label: "Components",
    slugs: [
      "confirm-button",
      "confirm-menu-item",
      "type-to-confirm",
      "confirm-dialog",
      "confirm-popover",
      "consequences",
      "undo-toast",
      "undoable",
    ],
  },
]

export type Page = {
  slug: string
  href: string
  title: string
  description: string
  group: string
  sheet: string
}

export function docsSource(slug: string) {
  return fs.readFileSync(path.join(contentDir, `${slug}.mdx`), "utf8")
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

export const pages: Page[] = groups
  .flatMap((group) => group.slugs.map((slug) => ({ slug, group: group.label })))
  .map(({ slug, group }, index) => {
    const meta = frontmatter(docsSource(slug))
    return {
      slug,
      href: slug === "introduction" ? "/docs" : `/docs/${slug}`,
      title: meta.title,
      description: meta.description,
      group,
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

export function exampleSource(name: string) {
  return exampleFile(name)
    .replace(/^"use client"\n+/, "")
    .replace(/^import \{ useLog \} from .*\n/m, "")
    .replace(/^ *const log = useLog\(\)\n\n?/m, "")
    .replace(/\blog\(/g, "console.log(")
    .trim()
}
