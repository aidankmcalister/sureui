"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonLabels() {
  const log = useLog()

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <ConfirmButton
        gesture="click-again"
        variant="outline"
        confirmLabel="Archive 12 threads?"
        onConfirm={() => log("Archived 12 threads")}
      >
        Archive all
      </ConfirmButton>
      <ConfirmButton
        undo
        variant="outline"
        undoLabel="Restore"
        onConfirm={() => log("Removed the member")}
        onCancel={() => log("Restored, nobody removed")}
      >
        Remove
      </ConfirmButton>
    </div>
  )
}
