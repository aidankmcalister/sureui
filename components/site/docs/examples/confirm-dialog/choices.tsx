"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogChoices() {
  const log = useLog()

  return (
    <ConfirmDialog
      title="Delete the orders database?"
      description="Apps connected to orders-db stop working."
      choices={[
        {
          name: "snapshot",
          label: "Take a final snapshot",
          defaultChecked: true,
        },
      ]}
      confirmLabel="Delete database"
      variant="destructive"
      onConfirm={({ snapshot }) =>
        log(
          snapshot ? "Saved a snapshot, deleted orders-db" : "Deleted orders-db"
        )
      }
      onCancel={() => log("Closed, nothing deleted")}
    >
      <Button variant="outline">Delete database</Button>
    </ConfirmDialog>
  )
}
