"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverHold() {
  const log = useLog()

  return (
    <ConfirmPopover
      description="Apps using this key will stop working right away."
      gesture="hold"
      confirmLabel="Hold to revoke"
      variant="destructive"
      onConfirm={() => log("Revoked sk_live_4f9a")}
      onCancel={() => log("Closed, nothing revoked")}
    >
      <Button variant="outline">Revoke key</Button>
    </ConfirmPopover>
  )
}
