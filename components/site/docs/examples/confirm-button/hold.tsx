"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonHold() {
  const log = useLog()
  const control = useControl()

  return (
    <ConfirmButton
      gesture="hold"
      duration={control("duration", 1200)}
      confirmOnRelease={control("confirmOnRelease", false)}
      variant="destructive"
      onConfirm={() => log("Revoked the key")}
      onCancel={() => log("Let go early, nothing revoked")}
    >
      Hold to revoke
    </ConfirmButton>
  )
}
