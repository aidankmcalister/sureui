"use client"

import { BulkConfirm } from "@/components/ui/sureui/bulk-confirm"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function BulkConfirmDemo() {
  const { deleteIssues } = useActions()
  const control = useControl()

  return (
    <BulkConfirm
      count={control("count", 3)}
      label={(count) => `Delete ${count} issues`}
      variant="destructive"
      onConfirm={deleteIssues}
    />
  )
}
