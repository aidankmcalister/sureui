"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function ConfirmDialogWait() {
  const { deleteWorkspace } = useActions()
  const control = useControl()

  return (
    <ConfirmDialog
      title="Delete the Acme workspace?"
      description="All 12 projects and their deployments are deleted. This can't be undone."
      confirmLabel="Delete workspace"
      variant="destructive"
      wait={control("wait", 3000)}
      onConfirm={deleteWorkspace}
    >
      <Button>Delete workspace</Button>
    </ConfirmDialog>
  )
}
