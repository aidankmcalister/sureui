"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmChoices() {
  const log = useLog()

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
      confirmLabel="Delete database"
      onConfirm={({ snapshot, notify }) =>
        log(`Deleted orders-db (snapshot: ${snapshot}, email: ${notify})`)
      }
      className="w-full max-w-sm"
    />
  )
}
