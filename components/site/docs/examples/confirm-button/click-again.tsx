"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonClickAgain() {
  const { deleteBranch } = useActions()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="click-again"
      timeout={control("timeout", 3000)}
      onConfirm={deleteBranch}
    >
      Delete branch
    </ConfirmButton>
  )
}
