"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogDemo() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Leave the Design team?"
      description="An admin can add you back later."
      confirmLabel="Leave team"
      variant="destructive"
      onConfirm={() => log("Left the Design team")}
      onCancel={() => log("Closed, still on the team")}
    >
      <Button variant="outline">Leave team</Button>
    </ConfirmDialog>
  )
}
