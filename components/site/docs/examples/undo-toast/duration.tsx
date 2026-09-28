"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useLog } from "@/components/site/docs/preview"

export default function UndoToastDuration() {
  const log = useLog()

  async function removeMembers() {
    const removed = await undoToast("Removed 4 members from Design", {
      duration: 10000,
    })
    log(removed ? "Removed 4 members" : "Undone, nobody removed")
  }

  return (
    <Button variant="outline" onClick={removeMembers}>
      Remove 4 members
    </Button>
  )
}
