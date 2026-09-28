"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogAlternative() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Delete the Q3 roadmap?"
      description="Archived projects are read-only and can be restored later."
      alternative={{
        label: "Archive instead",
        onSelect: () => log("Archived the Q3 roadmap"),
      }}
      confirmLabel="Delete"
      variant="destructive"
      onConfirm={() => log("Deleted the Q3 roadmap")}
      onCancel={() => log("Closed, nothing changed")}
    >
      <Button variant="outline">Delete project</Button>
    </ConfirmDialog>
  )
}
