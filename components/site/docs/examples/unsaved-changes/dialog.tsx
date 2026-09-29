"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useConfirmClose } from "@/components/ui/sureui/unsaved-changes"
import { useActions } from "@/components/site/docs/preview"

export default function UnsavedChangesDialog() {
  const { saveProfile } = useActions()
  const [saved, setSaved] = React.useState("Ada Lovelace")
  const [name, setName] = React.useState(saved)
  const { rootProps, question, close } = useConfirmClose(name !== saved, {
    onDiscard: () => setName(saved),
  })

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveProfile(name)
    setSaved(name)
    close()
  }

  function cancel() {
    setName(saved)
    close()
  }

  return (
    <Dialog {...rootProps}>
      <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
      <DialogContent>
        <form className="grid gap-4" onSubmit={save}>
          <DialogTitle>Edit profile</DialogTitle>
          <Input
            aria-label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <DialogFooter>
            {question ?? (
              <>
                <Button type="button" variant="outline" onClick={cancel}>
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
