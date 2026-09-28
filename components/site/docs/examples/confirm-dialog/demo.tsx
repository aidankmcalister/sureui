"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function ConfirmDialogDemo() {
  const log = useLog()

  async function leaveTeam() {
    await wait(1000)
    log("Left the Design team")
  }

  return (
    <ConfirmDialog
      title="Leave the Design team?"
      description="An admin can add you back later."
      confirmLabel="Leave team"
      variant="destructive"
      onConfirm={leaveTeam}
      onCancel={() => log("Closed, still on the team")}
    >
      <Button variant="outline">Leave team</Button>
    </ConfirmDialog>
  )
}
