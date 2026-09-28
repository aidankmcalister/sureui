import registry from "@/registry.json"
import { styles } from "@/lib/site/styles"

export type BlockAction = {
  action: string
  style: string | null
  why: string
}

type BlockNote = {
  name: string
  actions: BlockAction[]
}

export const blocksLead =
  "Full screens built from SureUI components. Each one installs with the shadcn CLI into your `components/` folder as app code you edit, and brings the SureUI components it uses."

export const blocksNote =
  "The sample handlers wait 600 ms so you can see the pending state. Replace them with your API calls."

const notes: BlockNote[] = [
  {
    name: "danger-zone-01",
    actions: [
      {
        action: "Pause deployments",
        style: "undo",
        why: "Pausing is easy to reverse, so it runs after a short undo window instead of asking first.",
      },
      {
        action: "Resume",
        style: null,
        why: "Resuming puts things back the way they were, so it runs on one click.",
      },
      {
        action: "Transfer project",
        style: "dialogs",
        why: "It changes access for two teams, so a dialog says who loses and who gains access first.",
      },
      {
        action: "Delete project",
        style: "type-to-confirm",
        why: "It is permanent and removes everything, so the dialog asks for the project name before it unlocks.",
      },
    ],
  },
]

function styleName(slug: string | null) {
  if (!slug) return "No confirmation"
  const style = styles.find((item) => item.slug === slug)
  if (!style) throw new Error(`Unknown style ${slug}`)
  return style.name
}

export const blocks = notes.map((note) => {
  const item = registry.items.find((entry) => entry.name === note.name)
  if (!item || item.type !== "registry:block") {
    throw new Error(`${note.name} is not a registry:block in registry.json`)
  }
  return {
    ...note,
    title: item.title,
    description: item.description,
    actions: note.actions.map((action) => ({
      ...action,
      styleName: styleName(action.style),
    })),
    files: item.files.map((file) => ({
      path: file.path,
      target: file.target.replace(/^@/, ""),
    })),
  }
})

export type Block = (typeof blocks)[number]
