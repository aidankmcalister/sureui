"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useActions } from "@/components/site/docs/preview"

export default function TypeToConfirmChoices() {
  const { deleteDatabase } = useActions()

  return (
    <TypeToConfirm
      phrase="orders-db"
      choices={[
        {
          name: "snapshot",
          label: "Take a final snapshot",
          defaultChecked: true,
        },
        { name: "notify", label: "Email the database owners" },
      ]}
      variant="destructive"
      confirmLabel="Delete database"
      onConfirm={deleteDatabase}
      className="w-full max-w-sm"
    />
  )
}
