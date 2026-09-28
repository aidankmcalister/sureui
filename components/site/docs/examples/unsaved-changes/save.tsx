"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUnsavedChanges } from "@/components/ui/sureui/unsaved-changes"
import { useLog } from "@/components/site/docs/preview"

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export default function UnsavedChangesSave() {
  const log = useLog()
  const [open, setOpen] = React.useState(true)
  const [saved, setSaved] = React.useState("Ship the beta on Friday")
  const [title, setTitle] = React.useState(saved)
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: title !== saved,
    onSave: async () => {
      await wait(800)
      setSaved(title)
      log(`Saved "${title}"`)
    },
    onDiscard: () => setTitle(saved),
  })

  async function close() {
    if (await confirmLeave()) {
      setOpen(false)
      log("Closed the task")
    }
  }

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open task
      </Button>
    )
  }

  return (
    <div className="grid w-full max-w-sm gap-3">
      <Label htmlFor="task-title">Task</Label>
      <Input
        id="task-title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button variant="outline" className="justify-self-start" onClick={close}>
        Close
      </Button>
      {dialog}
    </div>
  )
}
