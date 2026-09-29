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
import { Label } from "@/components/ui/label"
import { useConfirmClose } from "@/components/ui/sureui/unsaved-changes"
import { useLog } from "@/components/site/docs/preview"

export default function UnsavedChangesDialog() {
  const log = useLog()
  const [saved, setSaved] = React.useState("Ada Lovelace")
  const [name, setName] = React.useState(saved)
  const { rootProps, question, close } = useConfirmClose(name !== saved, {
    onDiscard: () => {
      setName(saved)
      log("Discarded the edits")
    },
  })

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(name)
    log(`Saved the name ${name}`)
    close()
  }

  return (
    <Dialog {...rootProps}>
      <DialogTrigger render={<Button variant="outline" />}>
        Edit profile
      </DialogTrigger>
      <DialogContent>
        <form className="grid gap-4" onSubmit={save}>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="profile-name">Name</Label>
            <Input
              id="profile-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <DialogFooter>
            {question ?? (
              <>
                <DialogClose render={<Button variant="outline" />}>
                  Cancel
                </DialogClose>
                <Button type="submit">Save</Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
