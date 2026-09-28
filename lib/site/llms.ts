import registry from "@/registry.json"
import { blocks, blocksLead, blocksNote, type Block } from "@/lib/site/blocks"
import { addArgs, siteUrl } from "@/lib/site/config"
import { howItsBuilt, type GuideSection } from "@/lib/site/how-its-built"
import {
  agentRules,
  contract,
  contractNote,
  coreNote,
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

function guideSection(section: GuideSection) {
  return [
    `## ${section.label}`,
    section.paragraphs.join("\n\n"),
    ...(section.items ? [list(section.items)] : []),
    ...(section.excerpt
      ? [
          `From \`${section.excerpt.file}\`:`,
          code(
            section.excerpt.file.endsWith(".tsx") ? "tsx" : "ts",
            section.excerpt.source
          ),
        ]
      : []),
  ]
}

function howItsBuiltBody() {
  const { core, states, sections } = howItsBuilt
  return [
    ...guideSection(core),
    ...guideSection(states),
    states.figure,
    list(states.notes.map((state) => `\`${state.name}\`: ${state.note}`)),
    ...sections.flatMap(guideSection),
  ]
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
      `[${coreNote.link}](${styleUrl(coreNote.slug)}) ${coreNote.text}`,
    ]
  }
  if (page.slug === "how-its-built") return howItsBuiltBody()
  if (page.slug === "agent-rules") {
    return [
      `## ${agentRules.intro.label}`,
      agentRules.intro.paragraphs.join("\n\n"),
      `## ${agentRules.shadcn.label}`,
      agentRules.shadcn.body,
      command(agentRules.shadcn.command),
      `## ${agentRules.skill.label}`,
      agentRules.skill.body,
      code("bash", agentRules.skill.command),
      `## ${agentRules.contents.label}`,
      list(agentRules.contents.items),
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
  return [
    "## Questions to ask",
    styles
      .map(
        (item, index) =>
          `${index + 1}. ${item.question} [${item.name}](${styleUrl(item.slug)})`
      )
      .join("\n"),
    "## At a glance",
    table(
      ["Style", "Interrupts", "Asks people to read", "Best for"],
      styles.map((item) => [
        item.name,
        item.interrupts,
        item.reads,
        item.bestFor,
      ])
    ),
  ]
}

function pageMarkdown(page: Page) {
  return [
    `# ${page.title}`,
    page.lead,
    `Source: ${siteUrl}${page.href}`,
    ...bodies(page),
  ].join("\n\n")
}

function blockMarkdown(block: Block) {
  return [
    `## ${block.title}`,
    `${block.description} Preview: ${siteUrl}/blocks#${block.name}`,
    command(addArgs([block.name])),
    `Installs ${block.files.map((file) => `\`${file.target}\``).join(", ")}.`,
    ...(block.setup ? [block.setup] : []),
    "### Why each action asks what it does",
    list(
      block.actions.map(
        (action) => `${action.action}: ${action.styleName}. ${action.why}`
      )
    ),
  ].join("\n\n")
}

function blocksMarkdown() {
  return [
    "# Blocks",
    blocksLead,
    blocksNote,
    `Source: ${siteUrl}/blocks`,
    ...blocks.map(blockMarkdown),
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
      registry.items
        .filter((item) => item.type !== "registry:block")
        .map(
          (item) =>
            `[@sureui/${item.name}](${siteUrl}/r/${item.name}.json): ${item.description}`
        )
    ),
    "## Blocks",
    list(
      blocks.map(
        (block) =>
          `[@sureui/${block.name}](${siteUrl}/r/${block.name}.json): ${block.description}`
      )
    ),
    "## Optional",
    list([
      `[Full docs](${siteUrl}/llms-full.txt): every page above and every block in one file`,
    ]),
  ].join("\n\n")
}

function llmsFull() {
  return [
    `# SureUI\n\n> ${description}`,
    ...pages.map(pageMarkdown),
    blocksMarkdown(),
  ].join("\n\n---\n\n")
}

function textResponse(body: string, type: string) {
  return new Response(body + "\n", {
    headers: { "Content-Type": `${type}; charset=utf-8` },
  })
}

export { llmsFull, llmsIndex, pageMarkdown, textResponse }
