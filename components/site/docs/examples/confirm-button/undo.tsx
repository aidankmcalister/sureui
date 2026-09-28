"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonUndo() {
  const log = useLog()
  const control = useControl()

  return (
    <ConfirmButton
      undo={control("undo", 5000)}
      variant="outline"
      onConfirm={() => log("Deleted brand-assets.zip")}
      onCancel={() => log("Undone, nothing deleted")}
    >
      Delete
    </ConfirmButton>
  )
}
