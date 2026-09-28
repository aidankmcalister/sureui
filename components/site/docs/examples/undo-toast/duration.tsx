"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useControl, useLog } from "@/components/site/docs/preview"

export default function UndoToastDuration() {
  const log = useLog()
  const control = useControl()

  async function removeMembers() {
    const removed = await undoToast("Removed 4 members from Design", {
      duration: control("duration", 10000),
    })
    log(removed ? "Removed 4 members" : "Undone, nobody removed")
  }

  return (
    <Button variant="outline" onClick={removeMembers}>
      Remove 4 members
    </Button>
  )
}
