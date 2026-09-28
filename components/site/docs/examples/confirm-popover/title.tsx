"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverTitle() {
  const log = useLog()

  return (
    <ConfirmPopover
      title="Remove Maya Chen?"
      description="She loses access to the Design team's projects."
      confirmLabel="Remove"
      variant="destructive"
      onConfirm={() => log("Removed Maya Chen")}
      onCancel={() => log("Closed, nobody removed")}
    >
      <Button variant="outline">Remove member</Button>
    </ConfirmPopover>
  )
}
