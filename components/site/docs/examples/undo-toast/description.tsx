"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useLog } from "@/components/site/docs/preview"

export default function UndoToastDescription() {
  const log = useLog()

  async function deleteBranch() {
    const deleted = await undoToast("Deleted feature/billing-v2", {
      description: "14 commits that aren't on main",
    })
    log(deleted ? "Deleted feature/billing-v2" : "Undone, branch kept")
  }

  return (
    <Button variant="outline" onClick={deleteBranch}>
      Delete branch
    </Button>
  )
}
