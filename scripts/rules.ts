import { mkdirSync, writeFileSync } from "node:fs"
import { registerHooks } from "node:module"
import { dirname } from "node:path"
import { pathToFileURL } from "node:url"

const root = pathToFileURL(`${process.cwd()}/`)

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith("@/")) return nextResolve(specifier, context)
    return nextResolve(new URL(`${specifier.slice(2)}.ts`, root).href, context)
  },
})

const { ruleFiles } = await import("@/lib/site/rules")

for (const file of ruleFiles) {
  mkdirSync(dirname(file.path), { recursive: true })
  writeFileSync(file.path, file.content)
  console.log(`Wrote ${file.path}`)
}
