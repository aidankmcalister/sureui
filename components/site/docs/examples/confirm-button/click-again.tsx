"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonClickAgain() {
  const log = useLog()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="click-again"
      timeout={control("timeout", 3000)}
      variant="outline"
      onConfirm={() => log("Archived")}
      onCancel={() => log("Disarmed, nothing archived")}
    >
      Archive
    </ConfirmButton>
  )
}
