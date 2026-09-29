"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useUnsavedChanges } from "@/components/ui/sureui/unsaved-changes"
import { useLog } from "@/components/site/docs/preview"

export default function UnsavedChangesDemo() {
  const log = useLog()
  const [page, setPage] = React.useState("General")
  const [saved, setSaved] = React.useState("Acme")
  const [name, setName] = React.useState(saved)
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: name !== saved,
    onDiscard: () => setName(saved),
  })

  async function navigate(to: string) {
    if (to === page) return
    if (await confirmLeave()) {
      setPage(to)
      log(`Opened ${to}`)
    } else {
      log(`Stayed on ${page}`)
    }
  }

  return (
    <div className="grid w-full max-w-sm gap-4">
      <nav className="flex gap-1">
        {["General", "Billing"].map((item) => (
          <Button
            key={item}
            variant={item === page ? "secondary" : "ghost"}
            size="sm"
            onClick={() => navigate(item)}
          >
            {item}
          </Button>
        ))}
      </nav>
      {page === "General" ? (
        <div className="grid gap-2">
          <Label htmlFor="team-name">Team name</Label>
          <div className="flex gap-2">
            <Input
              id="team-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Button
              disabled={name === saved}
              onClick={() => {
                setSaved(name)
                log(`Saved the team name as ${name}`)
              }}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Billing settings</p>
      )}
      {dialog}
    </div>
  )
}
