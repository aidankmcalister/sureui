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
  const [name, setName] = React.useState("Acme")
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: name !== "Acme",
    onDiscard: () => setName("Acme"),
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
          <Input
            id="team-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Billing settings</p>
      )}
      {dialog}
    </div>
  )
}
