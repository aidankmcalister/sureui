"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogInitialFocus() {
  const { publishChangelog } = useActions()

  return (
    <ConfirmDialog
      title="Publish the changelog?"
      description="Subscribers get an email with the release notes."
      initialFocus="confirm"
      confirmLabel="Publish"
      onConfirm={publishChangelog}
    >
      <Button>Publish</Button>
    </ConfirmDialog>
  )
}
