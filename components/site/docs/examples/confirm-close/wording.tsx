"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useConfirmClose } from "@/components/ui/sureui/confirm-close"
import { useLog } from "@/components/site/docs/preview"

export default function ConfirmCloseWording() {
  const log = useLog()
  const [draft, setDraft] = React.useState("")
  const { rootProps, question } = useConfirmClose(draft.trim() !== "", {
    title: "Delete this reply?",
    confirmLabel: "Delete reply",
    cancelLabel: "Keep writing",
    onDiscard: () => {
      setDraft("")
      log("Deleted the reply")
    },
  })

  return (
    <Dialog {...rootProps}>
      <DialogTrigger render={<Button variant="outline" />}>Reply</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reply to Grace</DialogTitle>
        </DialogHeader>
        <Input
          aria-label="Reply"
          placeholder="Write a reply"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <DialogFooter>
          {question ?? (
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
