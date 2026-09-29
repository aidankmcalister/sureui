"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmPopoverWait() {
  const { revokeKey } = useActions()
  const control = useControl()

  return (
    <ConfirmPopover
      description="Apps using this key stop working right away."
      confirmLabel="Revoke key"
      variant="destructive"
      wait={control("wait", 3000)}
      onConfirm={revokeKey}
    >
      <Button>Revoke key</Button>
    </ConfirmPopover>
  )
}
