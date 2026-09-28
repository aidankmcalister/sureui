"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogSeveralPhrases() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Delete acme-prod?"
      description="This deletes the project, its deployments and its domains for good."
      phrase={["acme-prod", "delete my project"]}
      confirmLabel="Delete project"
      variant="destructive"
      onConfirm={() => log("Deleted acme-prod")}
      onCancel={() => log("Closed, nothing deleted")}
    >
      <Button variant="outline">Delete project</Button>
    </ConfirmDialog>
  )
}
