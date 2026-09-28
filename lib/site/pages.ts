import { addArgs, githubUrl, items, siteUrl } from "@/lib/site/config"
import { styles } from "@/lib/site/styles"

export const intro = [
  'When every action opens an "Are you sure?" dialog, people stop reading and confirm on reflex, so the one dialog that matters gets the same click as the fifty before it.',
  "SureUI has other ways to ask: undo, a second click, a hold, a typed name, or a dialog when you want one. The Which one page has a question for each to help you choose.",
]

export const contractNote =
  "Every component takes the same `onConfirm`. Return a promise and the control stays pending until it settles."

export const coreNote = {
  slug: "how-its-built",
  link: "How it's built",
  text: "covers the confirmation core every control shares: its states, timing, undo window and tests.",
}

export const contract = `async function deleteProject() {
  await api.projects.delete(id)
}

<ConfirmButton undo onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="click-again" onConfirm={deleteProject}>Delete</ConfirmButton>
<ConfirmButton gesture="hold" onConfirm={deleteProject}>Delete</ConfirmButton>
<TypeToConfirm phrase="acme-prod" onConfirm={deleteProject} />
<ConfirmDialog title="Delete acme-prod?" onConfirm={deleteProject}>
  <Button>Delete</Button>
</ConfirmDialog>`

export type InstallStep = {
  title: string
  body: string
  command?: string
  code?: {
    lang: "json" | "tsx"
    label: string
    source: string
    highlight: number[]
  }
}

export const installSteps: InstallStep[] = [
  {
    title: "Set up shadcn/ui",
    body: "SureUI installs into a shadcn/ui project on Base UI, the shadcn default. If your project doesn't use shadcn yet, run:",
    command: "init",
  },
  {
    title: "Add the SureUI registry",
    body: "Add `@sureui` to the registries in your `components.json`:",
    code: {
      lang: "json",
      label: "components.json",
      source: `{
  "registries": {
    "@sureui": "${siteUrl}/r/{name}.json"
  }
}`,
      highlight: [3],
    },
  },
  {
    title: "Add the items you need",
    body: `Each item includes the confirmation core, so install only the ones you use: ${items
      .map((item, index) =>
        index === 0
          ? `\`${item}\``
          : `${index === items.length - 1 ? " or " : ", "}\`${item}\``
      )
      .join("")}.`,
    command: addArgs(["confirm-button"]),
  },
  {
    title: "Mount the Toaster for undo toasts",
    body: "`undoToast` shows a shadcn toast, so it needs the `Toaster` in your root layout. Nothing else needs setup.",
    code: {
      lang: "tsx",
      label: "app/layout.tsx",
      source: `import { Toaster } from "@/components/ui/sonner"

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}`,
      highlight: [1, 8],
    },
  },
]

export const agentRules = {
  intro: {
    label: "What it is",
    paragraphs: [
      "Coding agents tend to put every delete behind an alert dialog. The agent rules give them the Which one questions in order, the install command and usage for each style, and the contract every control shares.",
      "The rules are generated from the same data as these docs and change with them.",
    ],
  },
  shadcn: {
    label: "Install with shadcn",
    body: "With the `@sureui` registry in your `components.json`, add the `rules` item. It writes a Cursor rule to `.cursor/rules/sureui.mdc` and a Claude Code skill to `.claude/skills/sureui/SKILL.md`.",
    command: addArgs(["rules"]),
  },
  skill: {
    label: "Install as a skill",
    body: "The SureUI repository has the same rules as an agent skill. The skills CLI asks which agents to install it for.",
    command: `npx skills add ${githubUrl.replace("https://github.com/", "")}`,
  },
  contents: {
    label: "What's in it",
    items: [
      "The five questions, in order, each with examples and when to use something else.",
      "What counts as reversible, so a delete that can't be restored doesn't get Undo.",
      "The install command, usage and behavior of each style.",
      "The shared contract: `onConfirm`, `onCancel`, `undo` and `data-state`.",
    ],
  },
}

const docs = [
  {
    href: "/docs",
    slug: "introduction",
    title: "Introduction",
    group: "Getting started",
    lead: "What SureUI is, and how to choose how much to ask of people.",
  },
  {
    href: "/docs/installation",
    slug: "installation",
    title: "Installation",
    group: "Getting started",
    lead: "Add SureUI to a shadcn/ui project with the shadcn CLI.",
  },
  ...styles.map((style) => ({
    href: `/docs/${style.slug}`,
    slug: style.slug,
    title: style.name,
    group: "Components",
    lead: style.lead,
  })),
  {
    href: "/docs/which-one",
    slug: "which-one",
    title: "Which one should I use?",
    group: "Guides",
    lead: "A question for each style, and a table that compares them.",
  },
  {
    href: "/docs/agent-rules",
    slug: "agent-rules",
    title: "Agent rules",
    group: "Guides",
    lead: "Rules that tell coding agents which style fits an action, installed with the shadcn CLI or as a skill.",
  },
  {
    href: "/docs/how-its-built",
    slug: "how-its-built",
    title: "How it's built",
    group: "Guides",
    lead: "The confirmation core every control shares: its states, timing, undo window, handlers and tests.",
  },
]

export const pages = docs.map((page, index) => ({
  ...page,
  sheet: String(index + 1).padStart(2, "0"),
}))

export type Page = (typeof pages)[number]

export function getPage(href: string) {
  return pages.find((page) => page.href === href)
}
