"use client"

import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogChoices() {
  const { deleteDatabase } = useActions()

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
      onConfirm={deleteDatabase}
    >
      <Button>Delete database</Button>
    </ConfirmDialog>
  )
}
