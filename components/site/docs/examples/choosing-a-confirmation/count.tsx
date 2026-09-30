"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ChoosingByCount() {
  const { deleteIssues } = useActions()
  const control = useControl()
  const count = control("count", 3)
  const label = `Delete ${count} issues`

  if (count > 100) {
    return (
      <TypeToConfirm
        phrase={String(count)}
        confirmLabel={label}
        variant="destructive"
        onConfirm={deleteIssues}
        className="w-full max-w-sm"
      />
    )
  }

  return (
    <ConfirmButton
      gesture={count > 10 ? "click-again" : "click"}
      undo={count <= 10}
      variant="destructive"
      onConfirm={deleteIssues}
    >
      {label}
    </ConfirmButton>
  )
}
