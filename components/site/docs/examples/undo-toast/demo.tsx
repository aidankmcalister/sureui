"use client"

import { Button } from "@/components/ui/button"
import { undoToast } from "@/components/ui/sureui/undo-toast"
import { useActions } from "@/components/site/docs/preview"

export default function UndoToastDemo() {
  const { archiveMessages } = useActions()

  async function archive() {
    if (await undoToast("Archived 3 messages")) archiveMessages()
  }

  return <Button onClick={archive}>Archive</Button>
}
