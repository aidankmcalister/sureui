"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function UndoToastDuration() {
  const { removeMembers } = useActions()
  const control = useControl()

  async function remove() {
    const confirmed = await undoToast("Removed 4 members", {
      duration: control("duration", 10000),
    })
    if (confirmed) removeMembers()
  }

  return <Button onClick={remove}>Remove members</Button>
}
