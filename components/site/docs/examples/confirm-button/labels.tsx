"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmButtonLabels() {
  const { archiveAll, removeMember } = useActions()

  return (
    <div className="flex gap-2">
      <ConfirmButton
        gesture="click-again"
        confirmLabel="Archive 12 threads?"
        onConfirm={archiveAll}
      >
        Archive all
      </ConfirmButton>
      <ConfirmButton undo undoLabel="Restore" onConfirm={removeMember}>
        Remove
      </ConfirmButton>
    </div>
  )
}
