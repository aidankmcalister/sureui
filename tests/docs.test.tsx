import type * as React from "react"
import { describe, expect, it } from "vitest"

import type { Button } from "@/components/ui/button"
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { Switch } from "@/components/ui/switch"
import type {
  ConfirmationOptions,
  GestureOptions,
} from "@/components/ui/sureui/confirmation"
import type { ConfirmButtonProps } from "@/components/ui/sureui/confirm-button"
import type { ConfirmDialogProps } from "@/components/ui/sureui/confirm-dialog"
import type { ConfirmPopoverProps } from "@/components/ui/sureui/confirm-popover"
import type { ConfirmMenuItemProps } from "@/components/ui/sureui/confirm-menu-item"
import type { ConfirmSwitchProps } from "@/components/ui/sureui/confirm-switch"
import type {
  ConsequencesItemProps,
  ConsequencesProps,
} from "@/components/ui/sureui/consequences"
import type {
  ToolApprovalBatchProps,
  ToolApprovalProps,
} from "@/components/ui/sureui/tool-approval"
import type { TypeToConfirmProps } from "@/components/ui/sureui/type-to-confirm"
import type { UndoToastOptions } from "@/components/ui/sureui/undo-toast"
import type { UndoableProps } from "@/components/ui/sureui/undoable"
import type { UnsavedChangesOptions } from "@/components/ui/sureui/unsaved-changes"
import { docsSource, pages } from "@/lib/site/docs"
import { exampleFile, exampleNames } from "@/lib/site/examples"

type OwnProps<T> = Exclude<keyof T, keyof React.ComponentProps<typeof Button>>

const confirmButton = {
  onConfirm: true,
  onCancel: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  gesture: true,
  confirmLabel: true,
  undoLabel: true,
  announcements: true,
  timeout: true,
  duration: true,
  armDelay: true,
  wait: true,
  waitLabel: true,
  onConfirmError: true,
  errorLabel: true,
  holdFallback: true,
} satisfies Record<OwnProps<ConfirmButtonProps>, true>

const confirmMenuItem = {
  onConfirm: true,
  onCancel: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  gesture: true,
  menu: true,
  confirmLabel: true,
  undoLabel: true,
  announcements: true,
  timeout: true,
  duration: true,
  holdFallback: true,
  closeOnConfirm: true,
  armDelay: true,
  onConfirmError: true,
  errorLabel: true,
} satisfies Record<
  Exclude<
    keyof ConfirmMenuItemProps,
    keyof React.ComponentProps<typeof DropdownMenuItem>
  >,
  true
>

const typeToConfirm = {
  onConfirm: true,
  onCancel: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  phrase: true,
  caseSensitive: true,
  trim: true,
  label: true,
  consequences: true,
  announcements: true,
  confirmLabel: true,
  undoLabel: true,
  variant: true,
  acknowledgements: true,
  choices: true,
  renderActions: true,
  onConfirmError: true,
  errorLabel: true,
  className: true,
} satisfies Record<keyof TypeToConfirmProps, true>

const confirmDialog = {
  onConfirm: true,
  onCancel: true,
  title: true,
  description: true,
  consequences: true,
  cancelLabel: true,
  confirmLabel: true,
  variant: true,
  initialFocus: true,
  alternative: true,
  gesture: true,
  phrase: true,
  acknowledgements: true,
  choices: true,
  children: true,
  timeout: true,
  duration: true,
  holdFallback: true,
  caseSensitive: true,
  trim: true,
  armDelay: true,
  wait: true,
  waitLabel: true,
  onConfirmError: true,
  errorLabel: true,
  announcements: true,
} satisfies Record<keyof ConfirmDialogProps, true>

const confirmPopover = {
  onConfirm: true,
  onCancel: true,
  title: true,
  description: true,
  confirmLabel: true,
  cancelLabel: true,
  initialFocus: true,
  variant: true,
  gesture: true,
  children: true,
  timeout: true,
  duration: true,
  holdFallback: true,
  announcements: true,
  side: true,
  align: true,
  open: true,
  armDelay: true,
  wait: true,
  waitLabel: true,
  onConfirmError: true,
  errorLabel: true,
  onOpenChange: true,
} satisfies Record<keyof ConfirmPopoverProps, true>
const consequences = {
  subject: true,
  subjectDescription: true,
  items: true,
  title: true,
  variant: true,
  limit: true,
  expandable: true,
  moreLabel: true,
  lessLabel: true,
  children: true,
} satisfies Record<
  Exclude<
    keyof ConsequencesProps,
    Exclude<keyof React.ComponentProps<"div">, "title" | "children">
  >,
  true
>

const consequencesItem = {
  label: true,
  count: true,
  from: true,
  to: true,
  names: true,
  icon: true,
  description: true,
} satisfies Record<
  Exclude<keyof ConsequencesItemProps, keyof React.ComponentProps<"li">>,
  true
>

const undoToast = {
  message: true,
  description: true,
  duration: true,
  undoLabel: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
} satisfies Record<keyof UndoToastOptions | "message", true>

const undoable = {
  onConfirm: true,
  onCancel: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  children: true,
  render: true,
  label: true,
  undoLabel: true,
  onConfirmError: true,
  focusAfterRemove: true,
  announcements: true,
} satisfies Record<
  Exclude<
    keyof UndoableProps,
    Exclude<keyof React.ComponentPropsWithRef<"div">, "children">
  >,
  true
>

const unsavedChanges = {
  when: true,
  onSave: true,
  onDiscard: true,
  beforeUnload: true,
  title: true,
  saveTitle: true,
  description: true,
  keepLabel: true,
  discardLabel: true,
  saveLabel: true,
  onConfirmError: true,
  open: true,
  onOpenChange: true,
} satisfies Record<keyof UnsavedChangesOptions, true>

const toolApproval = {
  part: true,
  onRespond: true,
  risk: true,
  phrase: true,
  approveLabel: true,
  denyLabel: true,
  approvedLabel: true,
  deniedLabel: true,
  undo: true,
  timeout: true,
  duration: true,
  armDelay: true,
  errorLabel: true,
  onConfirmError: true,
  scopes: true,
  scopeLabels: true,
  note: true,
  noteLabel: true,
  className: true,
} satisfies Record<keyof ToolApprovalProps, true>

const toolApprovalBatch = {
  parts: true,
  onRespond: true,
  risk: true,
  phrase: true,
  approveLabel: true,
  denyLabel: true,
  approvedLabel: true,
  deniedLabel: true,
  undo: true,
  timeout: true,
  duration: true,
  armDelay: true,
  errorLabel: true,
  onConfirmError: true,
  scopes: true,
  scopeLabels: true,
  note: true,
  noteLabel: true,
  className: true,
} satisfies Record<keyof ToolApprovalBatchProps, true>

const confirmSwitch = {
  onConfirm: true,
  onCancel: true,
  onConfirmError: true,
  onCheckedChange: true,
  confirmWhen: true,
  undoIndicator: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  announcements: true,
} satisfies Record<
  | Exclude<keyof ConfirmSwitchProps, keyof React.ComponentProps<typeof Switch>>
  | "onCheckedChange",
  true
>

const useConfirmationOptions = {
  onConfirm: true,
  onCancel: true,
  onConfirmError: true,
  gesture: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  timeout: true,
  duration: true,
  holdFallback: true,
  armDelay: true,
  wait: true,
  disabled: true,
} satisfies Record<keyof (ConfirmationOptions & GestureOptions), true>

const documented = {
  ConfirmButton: confirmButton,
  ConfirmMenuItem: confirmMenuItem,
  ConfirmSwitch: confirmSwitch,
  TypeToConfirm: typeToConfirm,
  ConfirmDialog: confirmDialog,
  ConfirmPopover: confirmPopover,
  Consequences: consequences,
  ConsequencesItem: consequencesItem,
  "undoToast(message, options)": undoToast,
  Undoable: undoable,
  "useUnsavedChanges(options)": unsavedChanges,
  ToolApproval: toolApproval,
  ToolApprovalBatch: toolApprovalBatch,
  "useConfirmation(options)": useConfirmationOptions,
}

function tableAfter(heading: string) {
  for (const page of pages) {
    const source = docsSource(page.slug)
    const lines = source
      .slice(Math.max(0, source.indexOf("## API reference")))
      .split("\n")
    const start = lines.indexOf(`### ${heading}`)
    if (start === -1) continue
    const first = lines.findIndex(
      (line, index) => index > start && line.startsWith("|")
    )
    const end = lines.findIndex(
      (line, index) => index > first && !line.startsWith("|")
    )
    return lines.slice(first + 2, end === -1 ? undefined : end)
  }
  return []
}

function rowsFor(name: string) {
  return new Set(
    tableAfter(name)
      .map((row) => row.split(" | ")[0].replace(/^\| /, "").replace(/`/g, ""))
      .filter((prop) => !prop.startsWith("...") && !prop.startsWith("data-"))
      .map((prop) => prop.split(/[ .]/)[0])
  )
}

describe("docs", () => {
  it("every example on a page lives in that page's folder", () => {
    for (const page of pages) {
      for (const name of exampleNames(page.slug)) {
        expect(name.startsWith(`${page.slug}/`)).toBe(true)
        expect(exampleFile(name)).toContain("export default function")
      }
    }
  })

  it("every page has a title and description", () => {
    for (const page of pages) {
      expect(page.title).toBeTruthy()
      expect(page.description).toBeTruthy()
    }
  })

  it.each(Object.entries(documented))(
    "the %s props table matches its props",
    (name, props) => {
      expect([...rowsFor(name)].sort()).toEqual(Object.keys(props).sort())
    }
  )
})
