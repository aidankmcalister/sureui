"use client"

import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { useActions } from "@/components/site/docs/preview"

export default function ChoosingLow() {
  const { archiveConversations } = useActions()

  return (
    <ConfirmButton undo onConfirm={archiveConversations}>
      Archive 3 conversations
    </ConfirmButton>
  )
}
