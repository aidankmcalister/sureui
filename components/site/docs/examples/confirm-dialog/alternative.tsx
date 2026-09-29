"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogAlternative() {
  const { archiveProject, deleteProject } = useActions()

  return (
    <ConfirmDialog
      title="Delete the Q3 roadmap?"
      description="Archived projects are read-only and can be restored later."
      alternative={{ label: "Archive instead", onSelect: archiveProject }}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={deleteProject}
    >
      <Button>Delete project</Button>
    </ConfirmDialog>
  )
}
