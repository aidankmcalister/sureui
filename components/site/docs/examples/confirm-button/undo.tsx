"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonUndo() {
  const { deleteFile } = useActions()
  const control = useControl()

  return (
    <ConfirmButton undo={control("undo", 5000)} onConfirm={deleteFile}>
      Delete
    </ConfirmButton>
  )
}
