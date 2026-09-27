export const githubUrl = "https://github.com/aidankmcalister/sureui"

export function installCommand(item: string) {
  return `npx shadcn add @sureui/${item}`
}

const onConfirm = ["onConfirm", "() => void | Promise<unknown>", "required"]
const onCancel = ["onCancel", "() => void", "—"]
const undo = ["undo", "boolean | number", "—"]
const gesture = ["gesture", '"click" | "click-again" | "hold"', '"click"']
const buttonProps = ["...props", "Button props", "—"]
const dataState = [
  "data-state",
  '"idle" | "armed" | "holding" | "undo" | "pending"',
  '"idle"',
]

export type Style = {
  slug: string
  name: string
  lead: string
  summary: string
  question: string
  interrupts: string
  reads: string
  bestFor: string
  items: string[]
  usage: string
  api: { name: string; rows: string[][] }[]
  behavior?: string[]
  useWhen: string[]
  instead: { when: string; slug: string }[]
}

export const styles: Style[] = [
  {
    slug: "undo",
    name: "Undo",
    lead: "Act right away and give people a few seconds to take it back.",
    summary: "Runs on click, then offers a few seconds to take it back.",
    question: "Can it be taken back?",
    interrupts: "No",
    reads: "No",
    bestFor: "Trash, archive, anything you can restore",
    items: ["confirm-button", "undo-toast"],
    usage: `<ConfirmButton undo onConfirm={moveToTrash}>
  Move to trash
</ConfirmButton>

if (await undoToast("Moved 3 files to trash")) {
  await deleteFiles(ids)
}`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          ["undo", "boolean | number", "5000 when true, min 4000"],
          ["undoLabel", "ReactNode", '"Undo"'],
          ["announcements.undo", "string", '"Done. Undo is available."'],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          onConfirm,
          onCancel,
          dataState,
        ],
      },
      {
        name: "undoToast(message, options)",
        rows: [
          ["message", "ReactNode", "required"],
          ["description", "ReactNode", "—"],
          ["duration", "number", "5000, min 4000"],
          ["undoLabel", "string", '"Undo"'],
          ["pauseOnHover", "boolean", "true"],
          ["pauseOnFocus", "boolean", "true"],
        ],
      },
    ],
    behavior: [
      "Nothing runs until the window ends: 5 seconds by default, or the number you pass, at least 4 seconds.",
      "Undo calls onCancel, and onConfirm never runs.",
      "If someone leaves the button and comes back to it, by pointer or keyboard, the window pauses until they leave again. Turn this off with pauseUndoOnHover={false} or pauseUndoOnFocus={false}.",
      "Unmounting the control during the window drops the action without calling either handler. Closing the tab does the same.",
      "undoToast pauses while the toast is hovered or has keyboard focus, and while the tab is hidden. Turn this off with pauseOnHover: false or pauseOnFocus: false.",
      "Keep a trash or history view too, so people can still restore things after the window closes.",
    ],
    useWhen: [
      "Moving files to trash, archiving mail, hiding a post.",
      "People do it many times a day and expect it to be instant.",
      "A mistake is noticed right after it happens.",
    ],
    instead: [
      { when: "Nothing can bring it back", slug: "type-to-confirm" },
      { when: "It affects other people and needs explaining", slug: "dialogs" },
      { when: "The action can't wait a few seconds", slug: "click-again" },
    ],
  },
  {
    slug: "click-again",
    name: "Click again",
    lead: "The first click arms the button and the second one confirms.",
    summary: "The first click arms it, the second confirms.",
    question: "Is it one small item people act on often?",
    interrupts: "No",
    reads: "No",
    bestFor: "Single rows in a list",
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="click-again" onConfirm={archive}>
  Archive
</ConfirmButton>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          onConfirm,
          gesture,
          ["confirmLabel", "ReactNode", '"Click again to confirm"'],
          ["announcements.armed", "string", "confirmLabel when it's a string"],
          ["timeout", "number", "3000"],
          onCancel,
          undo,
          buttonProps,
          dataState,
        ],
      },
    ],
    useWhen: [
      "Archiving one message or removing one row.",
      "Space is tight and a dialog would be too much.",
      "Keyboard users need the same quick path as mouse users.",
    ],
    instead: [
      { when: "It's easy to reverse", slug: "undo" },
      { when: "A stray tap on a phone would be costly", slug: "hold" },
      { when: "It can't be undone", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "hold",
    name: "Hold",
    lead: "People press and hold until the fill completes. Letting go early cancels.",
    summary: "Press and hold until it fills. Letting go cancels.",
    question: "Could a stray tap trigger it?",
    interrupts: "No",
    reads: "No",
    bestFor: "Touch screens and small resets",
    items: ["confirm-button"],
    usage: `<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmButton>`,
    api: [
      {
        name: "ConfirmButton",
        rows: [
          onConfirm,
          gesture,
          ["duration", "number", "1200, min 800"],
          ["announcements.hold", "string", '"Press and hold to confirm"'],
          onCancel,
          undo,
          buttonProps,
          dataState,
        ],
      },
    ],
    useWhen: [
      "Revoking an API key or resetting preferences.",
      "Touch screens, where a second tap happens by accident.",
      "The effort should feel deliberate without opening anything.",
    ],
    instead: [
      { when: "People need to read what happens first", slug: "dialogs" },
      { when: "It's easy to reverse", slug: "undo" },
      { when: "It's permanent and large", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "dialogs",
    name: "Dialogs",
    lead: "An optional alert dialog for actions that need a sentence of explanation.",
    summary: "Opens a dialog, only when there is something to explain.",
    question: "Does it need explaining, or affect other people?",
    interrupts: "Yes",
    reads: "Yes",
    bestFor: "Actions that affect other people",
    items: ["confirm-dialog"],
    usage: `<ConfirmDialog
  title="Leave the Design team?"
  description="An admin can add you back later."
  confirmLabel="Leave team"
  variant="destructive"
  onConfirm={leaveTeam}
>
  <Button variant="outline">Leave team</Button>
</ConfirmDialog>

const { confirm, dialog } = useConfirm()

async function discard() {
  if (await confirm({ title: "Discard this draft?" })) deleteDraft()
}`,
    api: [
      {
        name: "ConfirmDialog",
        rows: [
          ["title", "string", "required"],
          onConfirm,
          ["children", "ReactElement (trigger)", "required"],
          onCancel,
          ["description", "ReactNode", "—"],
          ["cancelLabel", "string", '"Cancel"'],
          ["confirmLabel", "string", '"Confirm"'],
          ["variant", "Button variant", '"default"'],
          gesture,
          ["phrase", "string", "—"],
          ["acknowledgements", "string[]", "—"],
        ],
      },
      {
        name: "useConfirm()",
        rows: [
          ["returns", "{ confirm, dialog }", "—"],
          [
            "confirm(options)",
            "ConfirmDialog props, minus children and onCancel",
            "—",
          ],
          ["options.onConfirm", "() => void | Promise<unknown>", "—"],
          ["confirm() resolves", "Promise<boolean>", "—"],
        ],
      },
    ],
    useWhen: [
      "Leaving a team or removing someone else's access.",
      "The consequence takes a sentence to explain.",
      "You need to await the answer inside a handler, with useConfirm.",
    ],
    instead: [
      { when: "It's routine and reversible", slug: "undo" },
      { when: "One extra click is warning enough", slug: "click-again" },
      { when: "It deletes something large for good", slug: "type-to-confirm" },
    ],
  },
  {
    slug: "type-to-confirm",
    name: "Type to confirm",
    lead: "An inline form that unlocks only after the exact phrase is typed.",
    summary: "Unlocks only after the exact name is typed.",
    question: "Is it permanent and large?",
    interrupts: "No, unless in a dialog",
    reads: "Yes",
    bestFor: "Deleting projects, databases and accounts",
    items: ["type-to-confirm"],
    usage: `<TypeToConfirm
  phrase="acme-prod"
  acknowledgements={["I understand active deployments will go offline."]}
  confirmLabel="Delete project"
  onConfirm={deleteProject}
/>`,
    api: [
      {
        name: "TypeToConfirm",
        rows: [
          ["phrase", "string", "required"],
          ["label", "ReactNode", '"Type {phrase} to confirm"'],
          ["announcements.match", "string", '"Phrase matches"'],
          ["announcements.undo", "string", '"Done. Undo is available."'],
          ["pauseUndoOnHover", "boolean", "true"],
          ["pauseUndoOnFocus", "boolean", "true"],
          onConfirm,
          onCancel,
          undo,
          ["confirmLabel", "string", '"Confirm"'],
          ["undoLabel", "string", '"Undo"'],
          ["variant", "Button variant", '"destructive"'],
          ["acknowledgements", "string[]", "[]"],
          ["renderActions", "(confirmButton) => ReactNode", "—"],
          ["className", "string", "—"],
          dataState,
        ],
      },
    ],
    useWhen: [
      "Deleting a project, a database or an account.",
      "Nothing, including support, can bring the data back.",
      "People must read the name to be sure it's the right one.",
    ],
    instead: [
      { when: "You keep a copy for a while", slug: "undo" },
      { when: "It's one small item", slug: "click-again" },
      { when: "A sentence of warning is enough", slug: "dialogs" },
    ],
  },
]

const docs = [
  { href: "/docs", title: "Introduction", group: "Getting started" },
  {
    href: "/docs/installation",
    title: "Installation",
    group: "Getting started",
  },
  ...styles.map((style) => ({
    href: `/docs/${style.slug}`,
    title: style.name,
    group: "Components",
  })),
  {
    href: "/docs/which-one",
    title: "Which one should I use?",
    group: "Guides",
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

export function getStyle(slug: string) {
  return styles.find((style) => style.slug === slug)
}
