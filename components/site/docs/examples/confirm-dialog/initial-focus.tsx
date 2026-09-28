"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogInitialFocus() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Publish the changelog?"
      description="Subscribers get an email with the release notes."
      initialFocus="confirm"
      confirmLabel="Publish"
      onConfirm={() => log("Published the changelog")}
      onCancel={() => log("Closed, not published")}
    >
      <Button variant="outline">Publish</Button>
    </ConfirmDialog>
  )
}
