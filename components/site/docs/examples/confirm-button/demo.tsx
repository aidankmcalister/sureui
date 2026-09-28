"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmButtonDemo() {
  const log = useLog()

  return (
    <ConfirmButton
      gesture="click-again"
      variant="destructive"
      onConfirm={() => log("Deleted acme-prod")}
      onCancel={() => log("Disarmed, nothing deleted")}
    >
      Delete project
    </ConfirmButton>
  )
}
