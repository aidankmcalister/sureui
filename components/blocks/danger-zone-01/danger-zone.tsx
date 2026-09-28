"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ConfirmButton } from "@/components/ui/sureui/confirm-button"
import { ConfirmDialog } from "@/components/ui/sureui/confirm-dialog"

type DangerZoneProps = {
  project?: string
  team?: string
  transferTo?: string
  className?: string
}

function request() {
  return new Promise<void>((resolve) => setTimeout(resolve, 600))
}

function DangerZone({
  project = "acme-prod",
  team = "Acme",
  transferTo = "Design",
  className,
}: DangerZoneProps) {
  const [paused, setPaused] = React.useState(false)
  const [resuming, setResuming] = React.useState(false)
  const [owner, setOwner] = React.useState(team)
  const [deleted, setDeleted] = React.useState(false)
  const transferred = owner !== team

  if (deleted) {
    return (
      <Card role="status" className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle>{project} was deleted</CardTitle>
          <CardDescription>
            Its deployments, domains and data are gone.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const rows = [
    {
      title: "Pause deployments",
      description: paused
        ? "Paused. New pushes wait until you resume."
        : "Stop deploying new pushes.",
      action: paused ? (
        <Button
          variant="outline"
          size="sm"
          disabled={resuming}
          onClick={async () => {
            setResuming(true)
            await request()
            setPaused(false)
            setResuming(false)
          }}
        >
          Resume
        </Button>
      ) : (
        <ConfirmButton
          undo
          variant="outline"
          size="sm"
          onConfirm={async () => {
            await request()
            setPaused(true)
          }}
        >
          Pause
        </ConfirmButton>
      ),
    },
    {
      title: "Transfer project",
      description: transferred
        ? `Transferred to ${owner}.`
        : `Move ${project} to ${transferTo}.`,
      action: transferred ? null : (
        <ConfirmDialog
          title={`Transfer ${project} to ${transferTo}?`}
          description={`Members of ${team} lose access. Owners of ${transferTo} get the project, its deployments and domains.`}
          confirmLabel="Transfer"
          onConfirm={async () => {
            await request()
            setOwner(transferTo)
          }}
        >
          <Button variant="outline" size="sm">
            Transfer
          </Button>
        </ConfirmDialog>
      ),
    },
    {
      title: "Delete project",
      description: "Remove its deployments, domains and data.",
      action: (
        <ConfirmDialog
          title={`Delete ${project}?`}
          description="This removes the project, its deployments, domains and data. It can't be undone."
          phrase={project}
          acknowledgements={["Active deployments will go offline."]}
          confirmLabel="Delete project"
          variant="destructive"
          onConfirm={async () => {
            await request()
            setDeleted(true)
          }}
        >
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </ConfirmDialog>
      ),
    },
  ]

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
      </CardHeader>
      <CardContent className="divide-y">
        {rows.map((row) => (
          <div
            key={row.title}
            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
          >
            <div className="grid gap-1">
              <p className="font-medium">{row.title}</p>
              <p className="text-muted-foreground">{row.description}</p>
            </div>
            {row.action}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export { DangerZone, type DangerZoneProps }
