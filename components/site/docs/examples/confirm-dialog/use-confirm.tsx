"use client"

import { Button } from "@/components/ui/button"
import { useConfirm } from "@/components/ui/sureui/confirm-dialog"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmDialogUseConfirm() {
  const log = useLog()
  const { confirm, dialog } = useConfirm()

  async function discardDraft() {
    const discard = await confirm({
      title: "Discard this draft?",
      description: "Your edits to the Q3 roadmap won't be saved.",
      confirmLabel: "Discard",
      variant: "destructive",
    })
    log(discard ? "Discarded the draft" : "Kept the draft")
  }

  return (
    <>
      <Button variant="outline" onClick={discardDraft}>
        Discard draft
      </Button>
      {dialog}
    </>
  )
}
