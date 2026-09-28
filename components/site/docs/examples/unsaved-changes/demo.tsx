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
  const dirty = name !== saved
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: dirty,
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
            aria-current={item === page ? "page" : undefined}
            onClick={() => navigate(item)}
          >
            {item}
          </Button>
        ))}
      </nav>
      {page === "General" ? (
        <form
          className="grid gap-3"
          onSubmit={(event) => {
            event.preventDefault()
            setSaved(name)
            log(`Saved the team name as ${name}`)
          }}
        >
          <Label htmlFor="team-name">Team name</Label>
          <Input
            id="team-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={!dirty}>
              Save
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!dirty}
              onClick={() => setName(saved)}
            >
              Discard
            </Button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground">
          {saved} is on the Free plan.
        </p>
      )}
      {dialog}
    </div>
  )
}
