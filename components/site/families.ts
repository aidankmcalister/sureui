import {
  ConfirmButtonDemo,
  ConfirmDialogDemo,
  TypeToConfirmDemo,
  UndoDemo,
} from "@/components/site/demos"

export const siteUrl = "https://sureui.vercel.app"
export const githubUrl = "https://github.com/aidankmcalister/sureui"

export function installCommand(item: string) {
  return `npx shadcn@latest add ${siteUrl}/r/${item}.json`
}

export const families = [
  {
    slug: "undo",
    name: "Undo toast",
    friction: "No friction up front",
    description: "Act right away and offer an undo toast.",
    guidance: "The action can be reversed. Don't interrupt at all.",
    item: "undo-toast",
    Demo: UndoDemo,
    usage: `if (await undoToast("Moved 3 files to trash")) {
  await deleteFiles(ids)
}`,
    props: [
      ["message", "ReactNode", "required"],
      ["description", "ReactNode", "—"],
      ["duration", "number", "5000 (min 4000)"],
      ["undoLabel", "string", '"Undo"'],
    ],
  },
  {
    slug: "confirm-button",
    name: "Confirm button",
    friction: "Low friction",
    description:
      "One Button that confirms with a click, a second click, or a press-and-hold, with optional inline undo.",
    guidance: "One cheap item, like archiving a message or revoking a key.",
    item: "confirm-button",
    Demo: ConfirmButtonDemo,
    usage: `<ConfirmButton undo onConfirm={moveToTrash}>
  Move to trash
</ConfirmButton>

<ConfirmButton gesture="click-again" onConfirm={archive}>
  Archive
</ConfirmButton>

<ConfirmButton gesture="hold" variant="destructive" onConfirm={revoke}>
  Hold to revoke
</ConfirmButton>`,
    props: [
      ["onConfirm", "() => void | Promise<unknown>", "required"],
      ["gesture", '"click" | "click-again" | "hold"', '"click"'],
      ["onCancel", "() => void", "—"],
      ["undo", "boolean | number", "—"],
      ["confirmLabel", "ReactNode", '"Click again to confirm"'],
      ["undoLabel", "ReactNode", '"Undo"'],
      ["timeout", "number", "3000"],
      ["duration", "number", "1200 (min 800)"],
      ["...props", "Button props", "—"],
    ],
  },
  {
    slug: "type-to-confirm",
    name: "Type to confirm",
    friction: "High friction",
    description:
      "An inline form that unlocks only after the exact phrase is typed.",
    guidance: "Permanent and large, like deleting a project.",
    item: "type-to-confirm",
    Demo: TypeToConfirmDemo,
    usage: `<TypeToConfirm
  phrase="acme-prod"
  acknowledgements={["I understand active deployments will go offline."]}
  confirmLabel="Delete project"
  onConfirm={deleteProject}
/>`,
    props: [
      ["phrase", "string", "required"],
      ["onConfirm", "() => void | Promise<unknown>", "required"],
      ["onCancel", "() => void", "—"],
      ["undo", "boolean | number", "—"],
      ["confirmLabel", "string", '"Confirm"'],
      ["undoLabel", "string", '"Undo"'],
      ["variant", "Button variant", '"destructive"'],
      ["acknowledgements", "string[]", "[]"],
      ["className", "string", "—"],
    ],
  },
  {
    slug: "confirm-dialog",
    name: "Confirm dialog",
    friction: "Medium friction",
    description:
      "An optional alert dialog that wraps any trigger. Use useConfirm to await it in a handler.",
    guidance: "It affects other people and needs a sentence of explanation.",
    item: "confirm-dialog",
    Demo: ConfirmDialogDemo,
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
    props: [
      ["title", "string", "required"],
      ["onConfirm", "() => void | Promise<unknown>", "required"],
      ["children", "ReactElement (trigger)", "required"],
      ["onCancel", "() => void", "—"],
      ["description", "ReactNode", "—"],
      ["cancelLabel", "string", '"Cancel"'],
      ["confirmLabel", "string", '"Confirm"'],
      ["variant", "Button variant", '"default"'],
      ["gesture", '"click" | "click-again" | "hold"', '"click"'],
      ["phrase", "string", "—"],
      ["acknowledgements", "string[]", "—"],
    ],
  },
]
