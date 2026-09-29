import registry from "@/registry.json"
import { siteUrl } from "@/lib/site/config"
import { renderExample } from "@/lib/site/example-source"
import { loadExample } from "@/lib/site/examples"
import { docsBody, pageAt, pages, type Page } from "@/lib/site/docs"

const description =
  "Confirmation components for shadcn/ui: undo, click again, hold, type to confirm, dialogs and popovers. Installed with the shadcn CLI from the `@sureui` registry and built on Base UI."

function markdownUrl(page: Page) {
  return `${siteUrl}/llms/${page.slug}.md`
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n")
}

function toMarkdown(body: string) {
  return body
    .replace(
      /<Install args="([^"]+)" \/>/g,
      (_, args) => "```bash\nnpx shadcn@latest " + args + "\n```"
    )
    .replace(
      /<Example name="([^"]+)"[^>]*\/>/g,
      (_, name) => "```tsx\n" + renderExample(loadExample(name)) + "\n```"
    )
    .replace(/\]\(\/docs(?:\/([a-z-]+))?(?:#[a-z-]+)?\)/g, (_, slug) => {
      const page = pageAt(slug ? `/docs/${slug}` : "/docs")
      return `](${page ? markdownUrl(page) : siteUrl})`
    })
}

function pageMarkdown(page: Page) {
  return [
    `# ${page.title}`,
    page.description,
    `Source: ${siteUrl}${page.href}`,
    toMarkdown(docsBody(page.slug)),
  ].join("\n\n")
}

function llmsIndex() {
  return [
    "# SureUI",
    `> ${description}`,
    "Every component except ToolApproval takes the same `onConfirm`, which can return a promise, and sets `data-state` so you can style around it. Add the registry to `components.json` first; the Installation page shows how.",
    "## Docs",
    list(
      pages.map(
        (page) => `[${page.title}](${markdownUrl(page)}): ${page.description}`
      )
    ),
    "## Registry items",
    "This is every item. Install one with the exact command shown; don't guess other names.",
    list(
      registry.items.map(
        (item) =>
          `[@sureui/${item.name}](${siteUrl}/r/${item.name}.json): ${item.description} Install: \`npx shadcn@latest add @sureui/${item.name}\``
      )
    ),
    "## Optional",
    list([
      `[Full docs](${siteUrl}/llms-full.txt): every page above in one file`,
    ]),
  ].join("\n\n")
}

function llmsFull() {
  return [`# SureUI\n\n> ${description}`, ...pages.map(pageMarkdown)].join(
    "\n\n---\n\n"
  )
}

function textResponse(body: string, type: string) {
  return new Response(body + "\n", {
    headers: { "Content-Type": `${type}; charset=utf-8` },
  })
}

export { llmsFull, llmsIndex, pageMarkdown, textResponse }
