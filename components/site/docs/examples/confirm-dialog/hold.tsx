"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogHold() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Sign out everywhere?"
      description="Every device signed in to your account, including this one, will need to sign in again."
      gesture="hold"
      confirmLabel="Hold to sign out"
      variant="destructive"
      onConfirm={() => log("Signed out of 4 devices")}
      onCancel={() => log("Closed, still signed in")}
    >
      <Button variant="outline">Sign out everywhere</Button>
    </ConfirmDialog>
  )
}
