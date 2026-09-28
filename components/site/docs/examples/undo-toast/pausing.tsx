"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function UndoToastPausing() {
  const log = useLog()
  const control = useControl()

  async function markAllRead() {
    const marked = await undoToast("Marked 28 notifications as read", {
      pauseOnHover: control("pauseOnHover", false),
      pauseOnFocus: false,
    })
    log(marked ? "Marked 28 notifications as read" : "Undone, still unread")
  }

  return (
    <Button variant="outline" onClick={markAllRead}>
      Mark all as read
    </Button>
  )
}
