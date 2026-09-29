"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogHold() {
  const { signOutEverywhere } = useActions()

  return (
    <ConfirmDialog
      title="Sign out everywhere?"
      description="Every device signed in to your account, including this one, will need to sign in again."
      gesture="hold"
      confirmLabel="Hold to sign out"
      variant="destructive"
      onConfirm={signOutEverywhere}
    >
      <Button>Sign out everywhere</Button>
    </ConfirmDialog>
  )
}
