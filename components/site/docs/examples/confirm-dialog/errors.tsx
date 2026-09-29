"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogErrors() {
  const { publish, showError } = useActions({
    publish: { wait: 1000, fail: "Network error" },
  })

  return (
    <ConfirmDialog
      title="Publish the changelog?"
      confirmLabel="Publish"
      errorLabel="Couldn't publish. Retry"
      onConfirm={publish}
      onConfirmError={showError}
    >
      <Button>Publish</Button>
    </ConfirmDialog>
  )
}
