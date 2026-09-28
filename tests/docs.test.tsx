import type * as React from "react"
import { describe, expect, it } from "vitest"

import type { Button } from "@/components/ui/button"
import type { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import type { ConfirmButtonProps } from "@/components/ui/sureui/confirm-button"
import type { ConfirmDialogProps } from "@/components/ui/sureui/confirm-dialog"
import type { ConfirmPopoverProps } from "@/components/ui/sureui/confirm-popover"
import type { ConfirmMenuItemProps } from "@/components/ui/sureui/confirm-menu-item"
import type { TypeToConfirmProps } from "@/components/ui/sureui/type-to-confirm"
import type { UndoToastOptions } from "@/components/ui/sureui/undo-toast"
import { demoSlugs } from "@/components/site/docs/demos"
import { styles } from "@/lib/site/styles"

type OwnProps<T> = Exclude<keyof T, keyof React.ComponentProps<typeof Button>>

const confirmButton = {
  onConfirm: true,
  onCancel: true,
  undo: true,
  pauseUndoOnHover: true,
  pauseUndoOnFocus: true,
  gesture: true,
  confirmLabel: true,
  releaseLabel: true,
  undoLabel: true,
  announcements: true,
  timeout: true,
  duration: true,
  confirmOnRelease: true,
  cancelOnBlur: true,
  cancelHoldOnLeave: true,
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
  releaseLabel: true,
  undoLabel: true,
  announcements: true,
  timeout: true,
  duration: true,
  confirmOnRelease: true,
  cancelOnBlur: true,
  cancelHoldOnLeave: true,
  holdFallback: true,
  closeOnConfirm: true,
  closeOnUndo: true,
  commitUndoOnClose: true,
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
  announcements: true,
  confirmLabel: true,
  undoLabel: true,
  variant: true,
  acknowledgements: true,
  renderActions: true,
  className: true,
} satisfies Record<keyof TypeToConfirmProps, true>

const confirmDialog = {
  onConfirm: true,
  onCancel: true,
  title: true,
  description: true,
  cancelLabel: true,
  confirmLabel: true,
  variant: true,
  gesture: true,
  phrase: true,
  acknowledgements: true,
  children: true,
  timeout: true,
  cancelOnBlur: true,
  duration: true,
  confirmOnRelease: true,
  cancelHoldOnLeave: true,
  holdFallback: true,
  caseSensitive: true,
  trim: true,
  announcements: true,
} satisfies Record<keyof ConfirmDialogProps, true>

const confirmPopover = {
  onConfirm: true,
  onCancel: true,
  title: true,
  description: true,
  confirmLabel: true,
  cancelLabel: true,
  showCancel: true,
  variant: true,
  gesture: true,
  children: true,
  timeout: true,
  cancelOnBlur: true,
  duration: true,
  confirmOnRelease: true,
  cancelHoldOnLeave: true,
  announcements: true,
  side: true,
  align: true,
  open: true,
  onOpenChange: true,
} satisfies Record<keyof ConfirmPopoverProps, true>

const undoToast = {
  message: true,
  description: true,
  duration: true,
  undoLabel: true,
  pauseOnHover: true,
  pauseOnFocus: true,
} satisfies Record<keyof UndoToastOptions | "message", true>

const documented = {
  ConfirmButton: confirmButton,
  ConfirmMenuItem: confirmMenuItem,
  TypeToConfirm: typeToConfirm,
  ConfirmDialog: confirmDialog,
  ConfirmPopover: confirmPopover,
  "undoToast(message, options)": undoToast,
}

function rowsFor(name: string) {
  return new Set(
    styles
      .flatMap((style) => style.api)
      .filter((api) => api.name === name)
      .flatMap((api) => api.rows.map(([prop]) => prop))
      .filter((prop) => !prop.startsWith("...") && !prop.startsWith("data-"))
      .map((prop) => prop.split(/[ .]/)[0])
  )
}

describe("docs", () => {
  it("every style has a demo", () => {
    expect(demoSlugs.sort()).toEqual(styles.map((style) => style.slug).sort())
  })

  it.each(Object.entries(documented))(
    "the %s props tables match its props",
    (name, props) => {
      expect([...rowsFor(name)].sort()).toEqual(Object.keys(props).sort())
    }
  )
})
