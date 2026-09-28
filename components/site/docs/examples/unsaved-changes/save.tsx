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
    if (await confirmLeave()) log("Closed the task")
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
