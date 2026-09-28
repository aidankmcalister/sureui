import registry from "@/registry.json"
import { addArgs, siteUrl } from "@/lib/site/config"
import {
  contract,
  contractNote,
  installSteps,
  intro,
  pages,
  type Page,
} from "@/lib/site/pages"
import {
  sectionsFor,
  styles,
  whenLabels,
  type Style,
  type StyleSectionId,
} from "@/lib/site/styles"

const description =
  "Confirmation components for shadcn/ui: undo, click again, hold, type to confirm and dialogs. Installed with the shadcn CLI from the `@sureui` registry and built on Base UI."

function markdownUrl(page: Page) {
  return `${siteUrl}/llms/${page.slug}.md`
}

function styleUrl(slug: string) {
  const page = pages.find((item) => item.slug === slug)
  return page ? markdownUrl(page) : siteUrl
}

function command(args: string) {
  return "```bash\nnpx shadcn@latest " + args + "\n```"
}

function code(lang: string, source: string) {
  return "```" + lang + "\n" + source + "\n```"
}

function cell(text: string) {
  return text.replace(/\|/g, "\\|")
}

function table(head: string[], rows: string[][]) {
  return [head, head.map(() => "---"), ...rows]
    .map((row) => `| ${row.map(cell).join(" | ")} |`)
    .join("\n")
}

function list(items: string[]) {
  return items.map((item) => `- ${item}`).join("\n")
}

function styleSection(style: Style, id: StyleSectionId) {
  if (id === "installation") return [command(addArgs(style.items))]
  if (id === "usage") return [code("tsx", style.usage)]
  if (id === "behavior") return [list(style.behavior ?? [])]
  if (id === "props") {
    return style.api.flatMap((api) => [
      ...(style.api.length > 1 ? [`### ${api.name}`] : []),
      table(
        ["Prop", "Type", "Default"],
        api.rows.map(([name, type, value]) => [
          `\`${name}\``,
          `\`${type}\``,
          value,
        ])
      ),
    ])
  }
  return [
    `### ${whenLabels.use}`,
    list(style.useWhen),
    `### ${whenLabels.instead}`,
    list(
      style.instead.map((item) => {
        const other = styles.find((entry) => entry.slug === item.slug)
        return `${item.when}: [${other?.name}](${styleUrl(item.slug)})`
      })
    ),
  ]
}

function styleBody(style: Style) {
  return sectionsFor(style).flatMap((section) => [
    `## ${section.label}`,
    ...styleSection(style, section.id),
  ])
}

function bodies(page: Page) {
  const style = styles.find((item) => item.slug === page.slug)
  if (style) return styleBody(style)
  if (page.slug === "introduction") {
    return [
      "## The idea",
      intro.join("\n\n"),
      "## Five styles",
      list(
        styles.map(
          (item) => `[${item.name}](${styleUrl(item.slug)}): ${item.summary}`
        )
      ),
      "## One contract",
      contractNote,
      code("tsx", contract),
    ]
  }
  if (page.slug === "installation") {
    return installSteps.flatMap((step, index) => [
      `## ${index + 1}. ${step.title}`,
      step.body,
      ...(step.command ? [command(step.command)] : []),
      ...(step.code ? [code(step.code.lang, step.code.source)] : []),
    ])
  }
  return []
}

function pageMarkdown(page: Page) {
  return [
    `# ${page.title}`,
    page.lead,
    `Source: ${siteUrl}${page.href}`,
    ...bodies(page),
  ].join("\n\n")
}

function llmsIndex() {
  return [
    "# SureUI",
    `> ${description}`,
    `${contractNote} Every control sets \`data-state\` so you can style around it. Add the registry to \`components.json\` first; the Installation page shows how.`,
    "## Docs",
    list(
      pages.map((page) => `[${page.title}](${markdownUrl(page)}): ${page.lead}`)
    ),
    "## Registry items",
    list(
      registry.items.map(
        (item) =>
          `[@sureui/${item.name}](${siteUrl}/r/${item.name}.json): ${item.description}`
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
