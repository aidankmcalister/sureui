"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverPlacement() {
  const log = useLog()

  return (
    <ConfirmPopover
      side="top"
      align="start"
      description="The release notes go out to 1,204 subscribers."
      confirmLabel="Publish"
      onConfirm={() => log("Published v2.4.0")}
      onCancel={() => log("Closed, nothing published")}
    >
      <Button variant="outline">Publish release</Button>
    </ConfirmPopover>
  )
}
