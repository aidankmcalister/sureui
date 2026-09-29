"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useActions } from "@/components/site/docs/preview"

export default function UndoToastDescription() {
  const { deleteBranch } = useActions()

  async function remove() {
    const confirmed = await undoToast("Deleted feature/billing-v2", {
      description: "14 commits that aren't on main",
    })
    if (confirmed) deleteBranch("feature/billing-v2")
  }

  return <Button onClick={remove}>Delete branch</Button>
}
