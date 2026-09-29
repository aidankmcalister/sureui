"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverHold() {
  const { revokeKey } = useActions()

  return (
    <ConfirmPopover
      description="Apps using this key will stop working right away."
      gesture="hold"
      confirmLabel="Hold to revoke"
      onConfirm={revokeKey}
    >
      <Button>Revoke key</Button>
    </ConfirmPopover>
  )
}
