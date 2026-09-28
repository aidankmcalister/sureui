"use client"

import { TypeToConfirm } from "@/components/ui/sureui/type-to-confirm"
import { useLog } from "@/components/site/docs/preview"

export default function TypeToConfirmAcknowledgements() {
  const log = useLog()

  return (
    <TypeToConfirm
      phrase="orders-db"
      acknowledgements={[
        "I understand every backup of orders-db is deleted too.",
        "I understand apps connected to it stop working.",
      ]}
      confirmLabel="Delete database"
      onConfirm={() => log("Deleted orders-db and its backups")}
      className="w-full max-w-sm"
    />
  )
}
