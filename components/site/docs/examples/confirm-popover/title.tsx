"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmPopoverTitle() {
  const { removeMember } = useActions()

  return (
    <ConfirmPopover
      title="Remove Maya Chen?"
      description="She loses access to the Design team's projects."
      confirmLabel="Remove"
      onConfirm={removeMember}
    >
      <Button>Remove member</Button>
    </ConfirmPopover>
  )
}
