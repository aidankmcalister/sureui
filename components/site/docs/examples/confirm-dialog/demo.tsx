"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogDemo() {
  const { leaveTeam } = useActions()

  return (
    <ConfirmDialog
      title="Leave the Design team?"
      description="An admin can add you back later."
      confirmLabel="Leave team"
      variant="destructive"
      onConfirm={leaveTeam}
    >
      <Button>Leave team</Button>
    </ConfirmDialog>
  )
}
