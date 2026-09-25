import {
  ClickAgainDemo,
  DialogsDemo,
  HoldDemo,
  TypeDemo,
  UndoDemo,
} from "@/components/site/demos"

export const siteUrl = "https://sureui.vercel.app"

export function installCommand(item: string) {
  return `npx shadcn@latest add ${siteUrl}/r/${item}.json`
}

export type Family = (typeof families)[number]

export const families = [
  {
    slug: "undo",
    name: "Undo",
    friction: "None up front",
    useFor: "Bulk delete, archive, cancel an event.",
    guidance: "The action can be reversed. Don't interrupt at all.",
    description:
      "Act now and offer an undo toast. Resolves true when the toast closes and false if the person clicks Undo. Needs the shadcn <Toaster /> mounted.",
    item: "sure",
    Demo: UndoDemo,
    usage: `if (await sure.undo("Deleted 3 files")) {
  await deleteFiles(ids)
}`,
    props: [
      ["message", "ReactNode", "required"],
      ["duration", "number", "5000 (min 4000)"],
      ["undoLabel", "string", '"Undo"'],
      ["description", "ReactNode", "—"],
      ["signal", "AbortSignal", "—"],
    ],
  },
  {
    slug: "click-again",
    name: "Click again",
    friction: "Low",
    useFor: "Archive, discard, remove from a list.",
    guidance:
      "One cheap item. The confirmation stays where the person is already looking.",
    description:
      "The first click arms the button and swaps its label. A second click confirms. Timeout or blur cancels, and a double click is ignored. Style the armed state with data-armed.",
    item: "click-again-button",
    Demo: ClickAgainDemo,
    usage: `<ClickAgainButton onConfirm={archive} timeout={3000}>
  Archive
</ClickAgainButton>

const clickAgain = useClickAgain({ timeout: 3000 })
if (await clickAgain.request()) archive()`,
    props: [
      ["onConfirm", "() => void", "required"],
      ["timeout", "number", "3000"],
      ["confirmLabel", "ReactNode", '"Click again to confirm"'],
      ["...props", "Button props", "—"],
    ],
  },
  {
    slug: "hold",
    name: "Hold",
    friction: "Low",
    useFor: "Delete an item, reset settings, revoke.",
    guidance:
      "One item that is annoying to recreate. Holding takes intent but no reading.",
    description:
      "Press and hold until the fill completes. Releasing early drains it and cancels. Works with Space and Enter.",
    item: "hold-button",
    Demo: HoldDemo,
    usage: `<HoldButton variant="destructive" onConfirm={remove} duration={1200}>
  Hold to delete
</HoldButton>`,
    props: [
      ["onConfirm", "() => void", "required"],
      ["duration", "number", "1200 (min 800)"],
      ["...props", "Button props", "—"],
    ],
  },
  {
    slug: "dialogs",
    name: "Dialogs",
    friction: "Medium",
    useFor: "Leave a team, sign out everywhere, rename.",
    guidance:
      "It affects other people or needs an explanation of what happens next.",
    description:
      "Confirm, alert and prompt in a stock alert dialog. Mount <Sure /> once, then await from any handler.",
    item: "sure",
    Demo: DialogsDemo,
    usage: `const ok = await sure.confirm({
  title: "Leave the Design team?",
  description: "An admin can add you back later.",
  confirmLabel: "Leave team",
  variant: "destructive",
})

await sure.alert({ title: "Export finished" })

const name = await sure.prompt({ title: "Rename", defaultValue: "Design" })`,
    props: [
      ["title", "string", "required"],
      ["description", "ReactNode", "—"],
      ["confirmLabel", "string", '"Confirm"'],
      ["cancelLabel", "string", '"Cancel"'],
      ["variant", '"default" | "destructive"', '"default"'],
      ["signal", "AbortSignal", "—"],
    ],
  },
  {
    slug: "type-to-confirm",
    name: "Type to confirm",
    friction: "High",
    useFor: "Delete a project, repo, account or database.",
    guidance: "Permanent and large. Typing the name forces a real pause.",
    description:
      "The confirm button stays disabled until the phrase is typed exactly and every acknowledgement is checked.",
    item: "sure",
    Demo: TypeDemo,
    usage: `const ok = await sure.type({
  title: "Delete acme-prod?",
  phrase: "acme-prod",
  acknowledgements: ["I understand this can't be undone"],
  variant: "destructive",
})`,
    props: [
      ["phrase", "string", "required"],
      ["acknowledgements", "string[]", "—"],
      ["...options", "sure.confirm options", "—"],
    ],
  },
]
