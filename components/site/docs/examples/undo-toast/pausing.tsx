"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useActions, useControl } from "@/components/site/docs/preview"

export default function UndoToastPausing() {
  const { markAllRead } = useActions()
  const control = useControl()

  async function markRead() {
    const confirmed = await undoToast("Marked 28 notifications as read", {
      pauseUndoOnHover: control("pauseUndoOnHover", false),
      pauseUndoOnFocus: false,
    })
    if (confirmed) markAllRead()
  }

  return <Button onClick={markRead}>Mark all as read</Button>
}
