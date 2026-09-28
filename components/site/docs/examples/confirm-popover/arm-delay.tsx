"use client"

import { Button } from "@/components/ui/button"
import { ConfirmPopover } from "@/components/ui/sureui/confirm-popover"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function ConfirmPopoverArmDelay() {
  const log = useLog()
  const control = useControl()

  return (
    <ConfirmPopover
      description="Everyone on the team will be signed out."
      confirmLabel="Sign out all"
      variant="destructive"
      armDelay={control("armDelay", 500)}
      onConfirm={() => log("Signed out 12 sessions")}
      onCancel={() => log("Closed, nobody signed out")}
    >
      <Button variant="outline">Sign out everyone</Button>
    </ConfirmPopover>
  )
}
