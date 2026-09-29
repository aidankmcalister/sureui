"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmDialogArmDelay() {
  const { signOutEveryone } = useActions()
  const control = useControl()

  return (
    <ConfirmDialog
      title="Sign out everyone?"
      confirmLabel="Sign out all"
      armDelay={control("armDelay", 500)}
      onConfirm={signOutEveryone}
    >
      <Button>Sign out everyone</Button>
    </ConfirmDialog>
  )
}
