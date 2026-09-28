"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { Consequences } from "@/components/ui/sureui/consequences"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogConsequences() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Delete the staging environment?"
      description="Production isn't affected."
      consequences={
        <Consequences
          title="This deletes"
          variant="destructive"
          items={[
            { label: "Deployments", count: 42 },
            {
              label: "Domains",
              count: 2,
              names: ["staging.acme.com", "preview.acme.com"],
            },
            { label: "Environment variables", count: 18 },
          ]}
        />
      }
      confirmLabel="Delete environment"
      variant="destructive"
      onConfirm={() => log("Deleted staging")}
      onCancel={() => log("Closed, nothing deleted")}
    >
      <Button variant="outline">Delete staging</Button>
    </ConfirmDialog>
  )
}
