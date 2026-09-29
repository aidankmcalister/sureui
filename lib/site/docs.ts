import fs from "node:fs"
import path from "node:path"

const contentDir = path.join(process.cwd(), "content/docs")
const indexSlug = "introduction"

type SectionMeta = { title: string; pages: string[] }

export type Page = {
  slug: string
  href: string
  title: string
  description: string
  group: string
  section: string
}

export type Section = { folder: string; title: string; pages: Page[] }

export type Heading = { depth: 2 | 3; text: string; id: string }

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(contentDir, file), "utf8"))
}

function parse(source: string) {
  const [, block = "", body = source] =
    /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(source) ?? []
  const meta = Object.fromEntries(
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
  return { meta, body: body.trim() }
}

const sources = new Map<
  string,
  { file: string; source: string; body: string }
>()

export const sections: Section[] = readJson<{ sections: string[] }>(
  "meta.json"
).sections.map((folder) => {
  const { title, pages } = readJson<SectionMeta>(path.join(folder, "meta.json"))
  return {
    folder,
    title,
    pages: pages.map((slug) => {
      const file = path.join(contentDir, folder, `${slug}.mdx`)
      const source = fs.readFileSync(file, "utf8")
      const { meta, body } = parse(source)
      sources.set(slug, { file, source, body })
      return {
        slug,
        href: slug === indexSlug ? "/docs" : `/docs/${slug}`,
        title: meta.title,
        description: meta.description,
        group: title,
        section: folder,
      }
    }),
  }
})

export const pages = sections.flatMap((section) => section.pages)

export function getPage(slug: string) {
  return pages.find((page) => page.slug === slug)
}

export function pageAt(href: string) {
  return pages.find((page) => page.href === href)
}

export function staticParams() {
  return pages
    .filter((page) => page.slug !== indexSlug)
    .map((page) => ({ slug: page.slug }))
}

function read(slug: string) {
  const cached = sources.get(slug)
  if (!cached || process.env.NODE_ENV !== "development") return cached
  const source = fs.readFileSync(cached.file, "utf8")
  return { ...cached, source, body: parse(source).body }
}

export function docsSource(slug: string) {
  return read(slug)?.source ?? ""
}

export function docsBody(slug: string) {
  return read(slug)?.body ?? ""
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function headings(slug: string): Heading[] {
  let fenced = false
  return docsBody(slug)
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
