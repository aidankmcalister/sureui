import registry from "@/registry.json"
import { styles } from "@/lib/site/styles"

export type BlockAction = {
  action: string
  style: string | null
  why: string
}

type BlockNote = {
  name: string
  setup?: string
  actions: BlockAction[]
}

export const blocksLead =
  "Full screens built from SureUI components. The shadcn CLI installs each one into your `components/` folder as app code you edit, along with the SureUI components it uses."

export const blocksNote =
  "The sample handlers wait 600 ms so you can see the pending state. Replace them with your API calls."

const notes: BlockNote[] = [
  {
    name: "danger-zone-01",
    actions: [
      {
        action: "Pause deployments",
        style: "undo",
        why: "Pausing is easy to reverse, so it runs after an undo window without asking first.",
      },
      {
        action: "Resume",
        style: null,
        why: "Resuming puts things back the way they were, so it runs on one click.",
      },
      {
        action: "Transfer project",
        style: "dialogs",
        why: "It changes access for two teams, so a dialog first says who loses access and who gains it.",
      },
      {
        action: "Delete project",
        style: "type-to-confirm",
        why: "It is permanent and removes everything, so the dialog asks for the project name before it unlocks.",
      },
    ],
  },
  {
    name: "api-keys-01",
    actions: [
      {
        action: "Revoke key",
        style: "hold",
        why: "Revoking breaks every service using the key and can't be taken back, but it's one row among many. A hold takes a deliberate second without a dialog, and letting go early cancels.",
      },
      {
        action: "Create key",
        style: null,
        why: "Creating a key changes nothing that exists. The dialog shows the secret once and asks for no confirmation.",
      },
    ],
  },
  {
    name: "delete-account-01",
    actions: [
      {
        action: "Delete account",
        style: "type-to-confirm",
        why: "It is permanent and removes everything you have. Typing your email and checking each acknowledgement makes you read what goes before the form unlocks.",
      },
      {
        action: "Export data",
        style: null,
        why: "Exporting changes nothing, so it runs on one click. It sits above the delete form, where you see it first.",
      },
    ],
  },
  {
    name: "team-members-01",
    actions: [
      {
        action: "Remove from team",
        style: "click-again",
        why: "Removing one person is small, and an admin can invite them back. The menu item asks for a second click in place and stays open until then, so a stray click removes nobody.",
      },
      {
        action: "Make owner",
        style: "dialogs",
        why: "It changes what two people can do, and you can't take it back yourself. The dialog says what the new owner gets and what you lose before anything changes.",
      },
    ],
  },
  {
    name: "file-manager-01",
    setup: "Needs the shadcn `<Toaster />` in your root layout for Undo.",
    actions: [
      {
        action: "Move to trash",
        style: "undo",
        why: "Trashing is routine and easy to reverse, so it runs on one click. The files leave the list, so Undo is in a toast rather than on a control that is gone.",
      },
      {
        action: "Restore",
        style: null,
        why: "Restoring puts a file back, so it runs on one click. The Trash tab still works after the toast closes, so getting files back doesn't depend on a timed toast (WCAG 2.2.1, Timing Adjustable).",
      },
      {
        action: "Empty trash",
        style: "type-to-confirm",
        why: "It deletes every file in the trash for good. The dialog lists them and asks you to type empty trash before it unlocks.",
      },
    ],
  },
  {
    name: "inbox-01",
    actions: [
      {
        action: "Archive or delete from the list",
        style: "undo",
        why: "Clearing an inbox takes many quick actions in a row. Each runs on one click and collapses the row in place to an Undo at the same height, so the rows below don't move.",
      },
      {
        action: "Archive from the toolbar",
        style: "click-again",
        why: "Archiving is easy to reverse, but the toolbar moves on to the next message when it runs, so an Undo there would go with it. The small icon asks for a second click instead.",
      },
      {
        action: "Delete from the toolbar",
        style: "hold",
        why: "Deleting is permanent and the icon sits next to Archive. A hold takes a deliberate second, and letting go early cancels.",
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
