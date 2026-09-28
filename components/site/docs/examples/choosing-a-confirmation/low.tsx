"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useLog } from "@/components/site/docs/preview"

export default function ChoosingLow() {
  const log = useLog()

  return (
    <ConfirmButton
      undo
      variant="outline"
      onConfirm={() => log("Archived 3 conversations")}
      onCancel={() => log("Undone, nothing archived")}
    >
      Archive 3 conversations
    </ConfirmButton>
  )
}
