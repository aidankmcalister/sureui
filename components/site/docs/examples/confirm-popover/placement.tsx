"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverPlacement() {
  const { publishRelease } = useActions()

  return (
    <ConfirmPopover
      side="top"
      align="start"
      description="The release notes go out to 1,204 subscribers."
      confirmLabel="Publish"
      onConfirm={publishRelease}
    >
      <Button>Publish release</Button>
    </ConfirmPopover>
  )
}
