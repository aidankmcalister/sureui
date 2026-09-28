import type * as React from "react"
import { describe, expect, it } from "vitest"

import type { Button } from "@/components/ui/button"
import type { ConfirmButtonProps } from "@/components/ui/sureui/confirm-button"
import type { ConfirmDialogProps } from "@/components/ui/sureui/confirm-dialog"
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
} satisfies Record<OwnProps<ConfirmButtonProps>, true>

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
} satisfies Record<
  Exclude<keyof ConfirmDialogProps, "pauseUndoOnHover" | "pauseUndoOnFocus">,
  true
>

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
  TypeToConfirm: typeToConfirm,
  ConfirmDialog: confirmDialog,
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
