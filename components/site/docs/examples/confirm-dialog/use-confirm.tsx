"use client"

import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { useActions } from "@/components/site/docs/preview"

export default function ConfirmDialogUseConfirm() {
  const { discardDraft } = useActions()
  const { confirm, dialog } = useConfirm()

  async function handleDiscard() {
    const discard = await confirm({
      title: "Discard this draft?",
      description: "Your edits to the Q3 roadmap won't be saved.",
      confirmLabel: "Discard",
      variant: "destructive",
    })
    if (discard) discardDraft()
  }

  return (
    <>
      <Button onClick={handleDiscard}>Discard draft</Button>
      {dialog}
    </>
  )
}
