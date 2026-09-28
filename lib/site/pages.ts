import { addArgs, items, siteUrl } from "@/lib/site/config"
import { styles } from "@/lib/site/styles"

export const intro = [
  'When every action opens an "Are you sure?" dialog, people stop reading and confirm on reflex, so the one dialog that matters gets the same click as the fifty before it.',
  "SureUI gives you more ways to ask: an undo, a second click, a hold, a typed name, or a dialog when you want one. If you're not sure which fits, the Which one page has a question for each.",
]

export const contractNote =
  "Every component takes the same `onConfirm`. Return a promise and the control stays pending until it settles."

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
    body: "SureUI adds to a shadcn/ui project built on Base UI, the shadcn default. If your project doesn't use shadcn yet, start with:",
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
    body: `Each item brings the confirmation core with it, so install only the ones you use: ${items
      .map((item, index) =>
        index === 0
          ? `\`${item}\``
          : `${index === items.length - 1 ? " or " : ", "}\`${item}\``
      )
      .join("")}.`,
    command: addArgs(["confirm-button"]),
  },
  {
    title: "Mount the Toaster, for undo toasts only",
    body: "`undoToast` shows a shadcn toast. Everything else needs no setup.",
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
    lead: "A quick guide, if you're not sure where to start.",
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
