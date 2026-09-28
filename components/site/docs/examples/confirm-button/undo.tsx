"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonUndo() {
  const log = useLog()

  return (
    <ConfirmButton
      undo
      variant="outline"
      onConfirm={() => log("Deleted brand-assets.zip")}
      onCancel={() => log("Undone, nothing deleted")}
    >
      Delete
    </ConfirmButton>
  )
}
