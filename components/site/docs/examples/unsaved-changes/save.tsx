"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUnsavedChanges } from "@/components/ui/sureui/unsaved-changes"
import { useActions } from "@/components/site/docs/preview"

export default function UnsavedChangesSave() {
  const { saveTask, closeTask } = useActions({ saveTask: { wait: 800 } })
  const [saved, setSaved] = React.useState("Ship the beta")
  const [title, setTitle] = React.useState(saved)
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: title !== saved,
    onSave: async () => {
      await saveTask(title)
      setSaved(title)
    },
    onDiscard: () => setTitle(saved),
  })

  async function close() {
    if (await confirmLeave()) closeTask()
  }

  return (
    <div className="flex w-full max-w-sm gap-2">
      <Input
        aria-label="Task"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <Button onClick={close}>Close</Button>
      {dialog}
    </div>
  )
}
