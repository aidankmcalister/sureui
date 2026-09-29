"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"
import { useActions } from "@/components/site/docs/preview"

export default function ChoosingHigh() {
  const { deleteProject } = useActions()

  return (
    <ConfirmDialog
      title="Delete acme-prod?"
      description="This can't be undone."
      phrase="acme-prod"
      consequences={
        <Consequences
          title="This deletes"
          variant="destructive"
          items={[
            { label: "Deployments", count: 128 },
            { label: "Domains", count: 2, names: ["acme.com", "www.acme.com"] },
            { label: "Environment variables", count: 24 },
          ]}
        />
      }
      confirmLabel="Delete acme-prod"
      variant="destructive"
      onConfirm={deleteProject}
    >
      <Button>Delete project</Button>
    </ConfirmDialog>
  )
}
