"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmDialog() {
  const { deleteProject } = useActions()

  return (
    <ConfirmDialog
      title="Delete acme-prod?"
      description="This deletes the project, its deployments and its domains. It can't be undone."
      phrase="acme-prod"
      confirmLabel="Delete project"
      variant="destructive"
      onConfirm={deleteProject}
    >
      <Button>Delete project</Button>
    </ConfirmDialog>
  )
}
