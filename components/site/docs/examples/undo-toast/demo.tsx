"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useLog } from "@/components/site/docs/preview"

export default function UndoToastDemo() {
  const log = useLog()

  async function archive() {
    const archived = await undoToast("Archived 3 messages")
    log(
      archived
        ? "Resolved true, archived 3 messages"
        : "Resolved false, nothing archived"
    )
  }

  return (
    <Button variant="outline" onClick={archive}>
      Archive 3 messages
    </Button>
  )
}
