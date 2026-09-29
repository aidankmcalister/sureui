"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmButtonHold() {
  const { revokeKey } = useActions()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="hold"
      duration={control("duration", 1200)}
      onConfirm={revokeKey}
    >
      Hold to revoke
    </ConfirmButton>
  )
}
