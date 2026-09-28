"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonHold() {
  const log = useLog()

  return (
    <ConfirmButton
      gesture="hold"
      variant="destructive"
      onConfirm={() => log("Revoked the key")}
      onCancel={() => log("Let go early, nothing revoked")}
    >
      Hold to revoke
    </ConfirmButton>
  )
}
