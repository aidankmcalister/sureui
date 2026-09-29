"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUnsavedChanges } from "@/components/ui/sureui/unsaved-changes"

export default function UnsavedChangesDemo() {
  const [page, setPage] = React.useState("General")
  const [name, setName] = React.useState("Acme")
  const { confirmLeave, dialog } = useUnsavedChanges({
    when: name !== "Acme",
    onDiscard: () => setName("Acme"),
  })

  async function open(to: string) {
    if (await confirmLeave()) setPage(to)
  }

  return (
    <div className="grid w-full max-w-sm gap-4">
      <nav className="flex gap-1">
        {["General", "Billing"].map((item) => (
          <Button
            key={item}
            variant={item === page ? "secondary" : "ghost"}
            size="sm"
            onClick={() => open(item)}
          >
            {item}
          </Button>
        ))}
      </nav>
      {page === "General" ? (
        <Input
          aria-label="Team name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      ) : (
        <p className="text-sm text-muted-foreground">Billing settings</p>
      )}
      {dialog}
    </div>
  )
}
