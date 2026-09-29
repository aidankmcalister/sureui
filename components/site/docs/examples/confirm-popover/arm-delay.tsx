"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmPopoverArmDelay() {
  const { signOutEveryone } = useActions()
  const control = useControl()

  return (
    <ConfirmPopover
      description="Everyone on the team will be signed out."
      confirmLabel="Sign out all"
      armDelay={control("armDelay", 500)}
      onConfirm={signOutEveryone}
    >
      <Button>Sign out everyone</Button>
    </ConfirmPopover>
  )
}
