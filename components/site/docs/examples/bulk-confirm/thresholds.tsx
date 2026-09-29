"use client"

import { BulkConfirm } from "@/components/ui/sureui/bulk-confirm"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function BulkConfirmThresholds() {
  const { removeMembers } = useActions()
  const control = useControl()

  return (
    <BulkConfirm
      count={control("count", 25)}
      thresholds={{ undo: 1, clickAgain: 20 }}
      label={(count) => `Remove ${count} members`}
      variant="destructive"
      onConfirm={removeMembers}
    />
  )
}
