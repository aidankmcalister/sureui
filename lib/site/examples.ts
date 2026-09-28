import fs from "node:fs"
import path from "node:path"

import { docsSource } from "@/lib/site/docs"
import { parseExample } from "@/lib/site/example-source"

const examplesDir = path.join(process.cwd(), "components/site/docs/examples")

export function exampleNames(slug: string) {
  return [...docsSource(slug).matchAll(/<Example name="([^"]+)"/g)].map(
    (match) => match[1]
  )
}

export function exampleFile(name: string) {
  return fs.readFileSync(path.join(examplesDir, `${name}.tsx`), "utf8")
}

export function loadExample(name: string) {
  return parseExample(exampleFile(name))
}
