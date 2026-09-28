"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"

type Issue = {
  id: string
  key: string
  title: string
  status: "Todo" | "In progress" | "Backlog"
}

type BulkActionsProps = {
  initialIssues?: Issue[]
  undoLimit?: number
  typeLimit?: number
  className?: string
}

const sampleIssues: Issue[] = [
  {
    id: "iss_1",
    key: "ENG-412",
    title: "Login form loses focus",
    status: "Todo",
  },
  {
    id: "iss_2",
    key: "ENG-409",
    title: "Retry failed webhook deliveries",
    status: "In progress",
  },
  {
    id: "iss_3",
    key: "ENG-405",
    title: "Dark mode chart colors",
    status: "Todo",
  },
  {
    id: "iss_4",
    key: "ENG-398",
    title: "Flaky checkout test on CI",
    status: "Backlog",
  },
  {
    id: "iss_5",
    key: "ENG-391",
    title: "Export invoices as CSV",
    status: "Backlog",
  },
  {
    id: "iss_6",
    key: "ENG-387",
    title: "Rename workspace from settings",
    status: "Todo",
  },
  {
    id: "iss_7",
    key: "ENG-380",
    title: "Slow search on large projects",
    status: "In progress",
  },
  {
    id: "iss_8",
    key: "ENG-374",
    title: "Empty state for new teams",
    status: "Backlog",
  },
]

function issues(count: number) {
  return `${count} ${count === 1 ? "issue" : "issues"}`
}

function isIdle(button: HTMLElement) {
  return button.getAttribute("data-state") === "idle"
}

function request() {
  return Promise.resolve()
}

function BulkActions({
  initialIssues = sampleIssues,
  undoLimit = 2,
  typeLimit = 5,
  className,
}: BulkActionsProps) {
  const [rows, setRows] = React.useState(initialIssues)
  const [selected, setSelected] = React.useState<string[]>([])
  const [deleting, setDeleting] = React.useState(false)

  const count = selected.length
  const allSelected = rows.length > 0 && selected.length === rows.length
  const shown = deleting
    ? rows.filter((row) => !selected.includes(row.id))
    : rows
  const label = `Delete ${issues(count)}`

  function toggle(id: string, on: boolean) {
    setSelected((prev) =>
      on ? [...prev, id] : prev.filter((other) => other !== id)
    )
  }

  async function remove() {
    await request()
    setRows((prev) => prev.filter((row) => !selected.includes(row.id)))
    setDeleting(false)
    setSelected([])
  }

  let action: React.ReactNode
  if (count <= undoLimit) {
    action = (
      <ConfirmButton
        key="undo"
        undo
        variant="destructive"
        size="sm"
        onClick={(event) => {
          if (isIdle(event.currentTarget)) setDeleting(true)
        }}
        onCancel={() => setDeleting(false)}
        onConfirm={remove}
      >
        {label}
      </ConfirmButton>
    )
  } else if (count <= typeLimit) {
    action = (
      <ConfirmButton
        key="click-again"
        gesture="click-again"
        variant="destructive"
        size="sm"
        confirmLabel="Click again to delete"
        onConfirm={remove}
      >
        {label}
      </ConfirmButton>
    )
  } else {
    action = (
      <ConfirmDialog
        key="type"
        title={`Delete ${issues(count)}?`}
        description="This deletes the selected issues. It can't be undone."
        phrase={String(count)}
        confirmLabel={label}
        variant="destructive"
        onConfirm={remove}
      >
        <Button variant="destructive" size="sm">
          {label}
        </Button>
      </ConfirmDialog>
    )
  }

  return (
    <Card className={cn("@container/issues w-full", className)}>
      <CardHeader>
        <CardTitle>Open issues</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        <div className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2">
          <label className="flex items-center gap-3 text-muted-foreground">
            <Checkbox
              checked={allSelected && !deleting}
              indeterminate={selected.length > 0 && !allSelected && !deleting}
              disabled={rows.length === 0 || deleting}
              onCheckedChange={(on) =>
                setSelected(on ? rows.map((row) => row.id) : [])
              }
            />
            <span aria-live="polite">
              {deleting
                ? `Deleted ${issues(count)}`
                : count > 0
                  ? `${count} selected`
                  : "Select all"}
            </span>
          </label>
          {count > 0 && (
            <div className="ml-auto flex items-center gap-2">
              {!deleting && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelected([])}
                >
                  Clear
                </Button>
              )}
              {action}
            </div>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="border-t pt-3 text-muted-foreground">No open issues</p>
        ) : (
          <ul aria-label="Issues" className="divide-y border-t">
            {shown.map((row) => (
              <li key={row.id}>
                <label className="flex items-center gap-3 py-2.5">
                  <Checkbox
                    checked={selected.includes(row.id)}
                    disabled={deleting}
                    onCheckedChange={(on) => toggle(row.id, on)}
                  />
                  <span className="hidden w-16 shrink-0 font-mono text-xs text-muted-foreground @sm/issues:inline">
                    {row.key}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{row.title}</span>
                  <span className="hidden shrink-0 text-muted-foreground @md/issues:inline">
                    {row.status}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export { BulkActions, type BulkActionsProps, type Issue }
