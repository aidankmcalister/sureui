"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonClickAgain() {
  const log = useLog()

  return (
    <ConfirmButton
      gesture="click-again"
      variant="outline"
      onConfirm={() => log("Archived")}
      onCancel={() => log("Disarmed, nothing archived")}
    >
      Archive
    </ConfirmButton>
  )
}
